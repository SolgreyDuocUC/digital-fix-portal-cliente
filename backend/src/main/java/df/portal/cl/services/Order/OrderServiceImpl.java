package df.portal.cl.services.Order;

import df.portal.cl.config.PortalProperties;
import df.portal.cl.dto.Order.PedidoCreateDTO;
import df.portal.cl.dto.Order.PedidoResponseDTO;
import df.portal.cl.dto.Order.PedidoResponseDTO.HitoDTO;
import df.portal.cl.dto.Order.PedidoResponseDTO.ItemPedidoDTO;
import df.portal.cl.exceptions.NegocioException;
import df.portal.cl.exceptions.ServicioExternoException;
import df.portal.cl.model.cupones.Cupon;
import df.portal.cl.model.pedidos.Pedido;
import df.portal.cl.model.pedidos.PedidoItem;
import df.portal.cl.model.productos.ProductoTienda;
import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.model.usuarios.Usuario;
import df.portal.cl.remote.catalogo.CatalogoClient;
import df.portal.cl.remote.catalogo.CatalogoDtos.VerifyAndHoldRequest;
import df.portal.cl.remote.catalogo.CatalogoDtos.VerifyAndHoldResponse;
import df.portal.cl.remote.ordenes.OrdenesDtos.DireccionRemota;
import df.portal.cl.remote.ordenes.OrdenesDtos.OrdenPortalRequest;
import df.portal.cl.remote.ordenes.OrdenesDtos.SeguimientoOrden;
import df.portal.cl.remote.ordenes.OrdenesTrabajoClient;
import df.portal.cl.repository.CuponRepository;
import df.portal.cl.repository.PedidoRepository;
import df.portal.cl.services.Product.ProductService;
import df.portal.cl.services.Promo.PromoService;
import df.portal.cl.services.User.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Orquestación del checkout. No es una transacción distribuida: si falla un
 * paso, se compensa el
 * anterior (se libera la reserva de stock en ms-catalog) y el cliente recibe el
 * error del servicio
 * que falló. Las llamadas remotas quedan fuera de la transacción local, que
 * solo envuelve el guardado
 * del pedido y el uso del cupón.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    static final String ORIGEN_PORTAL = "PORTAL";
    static final String ORIGEN_ERP = "ERP";
    private static final String ALFABETO_CODIGO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();
    /** ms-workorders guarda sus fechas sin zona, en hora de Chile. */
    private static final ZoneId ZONA_ERP = ZoneId.of("America/Santiago");

    /**
     * Flujo de hitos que ve el cliente, igual al de ms-workorders
     * (PortalExternoServiceImpl.HITOS).
     * Solo se usa como respaldo, para dibujar el avance con el último estado
     * conocido cuando la
     * central no responde.
     */
    private static final List<HitoDTO> FLUJO_HITOS = List.of(
            new HitoDTO("CREADA", "Orden creada", "Solicitud recibida por la central", false, false),
            new HitoDTO("ASIGNADA", "Cuadrilla asignada", "Un equipo técnico tomó tu orden", false, false),
            new HitoDTO("EN_DESPLAZAMIENTO", "En camino", "El equipo va hacia tu dirección", false, false),
            new HitoDTO("EN_EJECUCION", "En terreno", "Trabajo en ejecución", false, false),
            new HitoDTO("CERRADA", "Finalizada", "Trabajo terminado y certificado", false, false));

    private final UserService userService;
    private final ProductService productService;
    private final PromoService promoService;
    private final CatalogoClient catalogoClient;
    private final OrdenesTrabajoClient ordenesTrabajoClient;
    private final PedidoRepository pedidoRepository;
    private final CuponRepository cuponRepository;
    private final TransactionTemplate transactionTemplate;
    private final PortalProperties props;

    // ---------------------------------------------------------------------
    // Checkout
    // ---------------------------------------------------------------------

    @Override
    public PedidoResponseDTO crear(Long idUsuario, PedidoCreateDTO dto) {
        Usuario usuario = userService.obtenerEntidad(idUsuario);
        if (usuario.getRut() == null) {
            throw NegocioException.invalido("Tu cuenta no tiene RUT registrado; complétalo en tu perfil para comprar");
        }
        Long idComuna = dto.direccion().idComuna() != null ? dto.direccion().idComuna() : usuario.getIdComuna();
        if (idComuna == null) {
            throw NegocioException.invalido("Indica la comuna de la dirección de atención");
        }

        // 1. Precios vigentes del ERP con el descuento de tienda (nunca los del
        // navegador).
        List<Linea> lineas = lineas(dto.items());
        BigDecimal subtotal = lineas.stream().map(Linea::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Cupón de Marketing (solo descuenta sobre el total del pedido).
        Cupon cupon = tieneTexto(dto.codigoCupon()) ? promoService.obtenerAplicable(dto.codigoCupon(), subtotal) : null;
        BigDecimal descuento = cupon != null ? cupon.calcularDescuento(subtotal) : BigDecimal.ZERO;

        String codigo = nuevoCodigo();

        // 3. Reserva de stock de los repuestos en ms-catalog (todo o nada).
        List<Linea> repuestos = lineas.stream().filter(l -> l.tipo() == TipoItemTienda.REPUESTO).toList();
        String tokenReserva = repuestos.isEmpty() ? null : reservarStock(codigo, repuestos);

        // 4. Orden de Trabajo en ms-workorders: desde aquí la ve y opera el portal de
        // empleados.
        SeguimientoOrden ot;
        try {
            ot = ordenesTrabajoClient.crearOrden(ordenParaErp(codigo, usuario, idComuna, dto, lineas, tokenReserva));
        } catch (RuntimeException ex) {
            catalogoClient.liberarReservaSilenciosamente(tokenReserva);
            throw ex;
        }

        // 5. Pedido local (detalle comercial) y uso del cupón, en una transacción.
        Pedido pedido = construirPedido(codigo, usuario, idComuna, dto, lineas, subtotal, descuento, cupon,
                tokenReserva, ot);
        try {
            transactionTemplate.executeWithoutResult(status -> {
                pedidoRepository.save(pedido);
                if (cupon != null) {
                    // Se relee para que @Version detecte usos simultáneos.
                    cuponRepository.findById(cupon.getIdCupon()).ifPresent(Cupon::registrarUso);
                }
            });
        } catch (RuntimeException ex) {
            // La OT ya existe en el ERP: se deja constancia para conciliarla a mano.
            log.error("La OT {} se creó para el pedido {} ({}) pero el pedido no se pudo guardar en el portal",
                    ot.idOrdenTrabajo(), codigo, usuario.getEmail(), ex);
            throw new NegocioException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Tu solicitud llegó a la central como " + ot.codigoSeguimiento()
                            + ", pero no pudimos registrarla en tu historial. Contáctanos con ese código.");
        }
        log.info("Pedido {} de {} creado como {}", codigo, usuario.getEmail(), ot.codigoSeguimiento());
        return respuestaDePedido(pedido, ot, true);
    }

    /** Agrupa líneas repetidas y les asigna el precio vigente. */
    private List<Linea> lineas(List<PedidoCreateDTO.ItemDTO> items) {
        Map<String, Integer> cantidades = new LinkedHashMap<>();
        Map<String, PedidoCreateDTO.ItemDTO> porClave = new HashMap<>();
        for (PedidoCreateDTO.ItemDTO item : items) {
            String clave = item.tipo() + ":" + item.id();
            cantidades.merge(clave, item.cantidad(), Integer::sum);
            porClave.putIfAbsent(clave, item);
        }

        List<Linea> lineas = new ArrayList<>();
        cantidades.forEach((clave, cantidad) -> {
            PedidoCreateDTO.ItemDTO item = porClave.get(clave);
            ProductoTienda producto = productService.itemVendible(item.tipo(), item.id());
            if (item.tipo() == TipoItemTienda.SERVICIO && cantidad > 1) {
                throw NegocioException.invalido("El servicio \"" + producto.getNombreParaMostrar()
                        + "\" se agenda una vez por pedido (cantidad 1)");
            }
            if (item.tipo() == TipoItemTienda.REPUESTO && !producto.tieneStockDisponible()) {
                throw NegocioException
                        .conflicto("\"" + producto.getNombreParaMostrar() + "\" no tiene stock disponible");
            }
            lineas.add(new Linea(item.tipo(), item.id(), producto.getCodigo(), producto.getNombreParaMostrar(),
                    cantidad, producto.getPrecioFinal()));
        });
        return lineas;
    }

    private String reservarStock(String codigo, List<Linea> repuestos) {
        VerifyAndHoldResponse hold = catalogoClient.verificarYReservar(new VerifyAndHoldRequest(
                codigo,
                props.stock().minutosReserva(),
                repuestos.stream().map(l -> new VerifyAndHoldRequest.ItemHold(l.id(), l.cantidad())).toList()));
        if (!hold.exitoso()) {
            List<String> faltantes = Optional.ofNullable(hold.detalles()).orElse(List.of()).stream()
                    .filter(d -> !d.disponible())
                    .map(d -> d.nombre() + ": pediste " + d.cantidadSolicitada() + ", hay " + d.stockDisponibleReal())
                    .toList();
            throw new NegocioException(HttpStatus.CONFLICT, "No hay stock suficiente para uno o más repuestos",
                    faltantes);
        }
        return hold.tokenReserva();
    }

    private static OrdenPortalRequest ordenParaErp(String codigo, Usuario usuario, Long idComuna, PedidoCreateDTO dto,
            List<Linea> lineas, String tokenReserva) {
        PedidoCreateDTO.DireccionDTO d = dto.direccion();
        return new OrdenPortalRequest(
                codigo,
                new OrdenPortalRequest.ClientePortal(usuario.getRut(), usuario.getNombreParaErp(),
                        usuario.getTelefono(), usuario.getEmail()),
                new DireccionRemota(idComuna, d.calle(), d.numero(), d.detalle(), d.referencia(), d.codigoPostal()),
                lineas.stream().filter(l -> l.tipo() == TipoItemTienda.SERVICIO).map(Linea::id).toList(),
                lineas.stream().filter(l -> l.tipo() == TipoItemTienda.REPUESTO)
                        .map(l -> new OrdenPortalRequest.RepuestoSolicitado(l.id(), l.codigo(), l.nombre(),
                                l.cantidad()))
                        .toList(),
                dto.horarioPreferido(),
                dto.notas(),
                tokenReserva);
    }

    private static Pedido construirPedido(String codigo, Usuario usuario, Long idComuna, PedidoCreateDTO dto,
            List<Linea> lineas, BigDecimal subtotal, BigDecimal descuento, Cupon cupon,
            String tokenReserva, SeguimientoOrden ot) {
        PedidoCreateDTO.DireccionDTO d = dto.direccion();
        Pedido pedido = Pedido.builder()
                .codigo(codigo)
                .usuario(usuario)
                .idOrdenTrabajo(ot.idOrdenTrabajo())
                .ultimoEstadoConocido(ot.estado())
                .tokenReservaStock(tokenReserva)
                .calle(d.calle().strip())
                .numero(d.numero().strip())
                .detalleDireccion(textoOpcional(d.detalle()))
                .idComuna(idComuna)
                .comuna(textoOpcional(d.comuna()))
                .horarioPreferido(textoOpcional(dto.horarioPreferido()))
                .notas(textoOpcional(dto.notas()))
                .subtotal(subtotal)
                .descuento(descuento)
                .total(subtotal.subtract(descuento))
                .codigoCupon(cupon != null ? cupon.getCodigo() : null)
                .build();
        lineas.forEach(l -> pedido.agregarItem(PedidoItem.builder()
                .tipoItem(l.tipo())
                .idMicroservicio(l.id())
                .codigo(l.codigo())
                .nombre(l.nombre())
                .cantidad(l.cantidad())
                .precioUnitario(l.precioUnitario())
                .build()));
        return pedido;
    }

    private String nuevoCodigo() {
        String codigo;
        do {
            StringBuilder sb = new StringBuilder("PED-");
            for (int i = 0; i < 6; i++) {
                sb.append(ALFABETO_CODIGO.charAt(RANDOM.nextInt(ALFABETO_CODIGO.length())));
            }
            codigo = sb.toString();
        } while (pedidoRepository.existsByCodigo(codigo));
        return codigo;
    }

    // ---------------------------------------------------------------------
    // Consulta y seguimiento
    // ---------------------------------------------------------------------

    @Override
    public List<PedidoResponseDTO> misPedidos(Long idUsuario) {
        Usuario usuario = userService.obtenerEntidad(idUsuario);
        List<Pedido> pedidos = pedidoRepository.findByUsuario_IdUsuarioOrderByFechaCreacionDesc(idUsuario);

        Map<Long, SeguimientoOrden> otsDelErp;
        boolean enVivo;
        try {
            otsDelErp = usuario.getRut() == null ? Map.of()
                    : ordenesTrabajoClient.ordenesDelCliente(usuario.getRut()).stream()
                            .collect(Collectors.toMap(SeguimientoOrden::idOrdenTrabajo, Function.identity(),
                                    (a, b) -> a));
            enVivo = true;
        } catch (ServicioExternoException ex) {
            otsDelErp = Map.of();
            enVivo = false;
        }

        List<PedidoResponseDTO> respuesta = new ArrayList<>();
        Set<Long> otsDePedidos = new HashSet<>();
        List<Pedido> conEstadoNuevo = new ArrayList<>();
        for (Pedido pedido : pedidos) {
            SeguimientoOrden ot = otsDelErp.get(pedido.getIdOrdenTrabajo());
            otsDePedidos.add(pedido.getIdOrdenTrabajo());
            if (ot != null && !ot.estado().equals(pedido.getUltimoEstadoConocido())) {
                pedido.setUltimoEstadoConocido(ot.estado());
                conEstadoNuevo.add(pedido);
            }
            respuesta.add(respuestaDePedido(pedido, ot, enVivo && ot != null));
        }
        // OT creadas por la central para este cliente (no pasaron por la tienda).
        otsDelErp.values().stream()
                .filter(ot -> !otsDePedidos.contains(ot.idOrdenTrabajo()))
                .map(OrderServiceImpl::respuestaDeOtDelErp)
                .forEach(respuesta::add);

        guardarEstadosConocidos(conEstadoNuevo);
        respuesta.sort(Comparator.comparing(PedidoResponseDTO::fechaCreacion,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return respuesta;
    }

    @Override
    public PedidoResponseDTO obtener(Long idUsuario, String codigo) {
        Usuario usuario = userService.obtenerEntidad(idUsuario);
        String normalizado = codigo == null ? "" : codigo.strip().toUpperCase(Locale.ROOT);

        if (normalizado.startsWith("OT-")) {
            Long idOt = parsearIdOt(normalizado);
            SeguimientoOrden ot = seguimientoDelCliente(idOt, usuario);
            return pedidoRepository.findByUsuario_IdUsuarioOrderByFechaCreacionDesc(idUsuario).stream()
                    .filter(p -> p.getIdOrdenTrabajo().equals(idOt))
                    .findFirst()
                    .map(p -> respuestaDePedido(p, ot, true))
                    .orElseGet(() -> respuestaDeOtDelErp(ot));
        }

        Pedido pedido = pedidoRepository.findByCodigoAndUsuario_IdUsuario(normalizado, idUsuario)
                .orElseThrow(() -> NegocioException.noEncontrado("No tienes un pedido " + normalizado));
        try {
            SeguimientoOrden ot = seguimientoDelCliente(pedido.getIdOrdenTrabajo(), usuario);
            if (!ot.estado().equals(pedido.getUltimoEstadoConocido())) {
                pedido.setUltimoEstadoConocido(ot.estado());
                guardarEstadosConocidos(List.of(pedido));
            }
            return respuestaDePedido(pedido, ot, true);
        } catch (ServicioExternoException ex) {
            return respuestaDePedido(pedido, null, false);
        }
    }

    private SeguimientoOrden seguimientoDelCliente(Long idOt, Usuario usuario) {
        if (usuario.getRut() == null) {
            throw NegocioException.noEncontrado("No tienes una orden OT-" + idOt);
        }
        // ms-workorders responde 404 si la OT no es de este RUT.
        return ordenesTrabajoClient.seguimiento(idOt, usuario.getRut());
    }

    private void guardarEstadosConocidos(List<Pedido> pedidos) {
        if (pedidos.isEmpty()) {
            return;
        }
        try {
            transactionTemplate
                    .executeWithoutResult(s -> pedidos.forEach(p -> pedidoRepository.findById(p.getIdPedido())
                            .ifPresent(guardado -> guardado.setUltimoEstadoConocido(p.getUltimoEstadoConocido()))));
        } catch (RuntimeException ex) {
            log.warn("No se pudo actualizar el último estado conocido de {} pedido(s): {}", pedidos.size(),
                    ex.getMessage());
        }
    }

    private static Long parsearIdOt(String codigo) {
        try {
            return Long.parseLong(codigo.substring(3));
        } catch (NumberFormatException ex) {
            throw NegocioException.noEncontrado("No existe la orden " + codigo);
        }
    }

    // ---------------------------------------------------------------------
    // Mapeos
    // ---------------------------------------------------------------------

    static PedidoResponseDTO respuestaDePedido(Pedido pedido, SeguimientoOrden ot, boolean enVivo) {
        String estado = ot != null ? ot.estado() : pedido.getUltimoEstadoConocido();
        return new PedidoResponseDTO(
                pedido.getCodigo(),
                ORIGEN_PORTAL,
                pedido.getIdOrdenTrabajo(),
                "OT-" + pedido.getIdOrdenTrabajo(),
                pedido.getFechaCreacion(),
                estado,
                ot != null ? ot.estadoEtiqueta() : etiquetaDeEstado(estado),
                enVivo,
                ot != null ? hitos(ot) : hitosSegunEstado(estado),
                ot != null ? ot.cuadrilla() : null,
                ot != null ? ot.fechaActualizacionEstado() : null,
                ot != null ? ot.fechaCierre() : null,
                pedido.direccionTexto(),
                pedido.getHorarioPreferido(),
                pedido.getNotas(),
                pedido.getItems().stream()
                        .map(i -> new ItemPedidoDTO(i.getTipoItem(), i.getIdMicroservicio(), i.getCodigo(),
                                i.getNombre(),
                                i.getCantidad(), i.getPrecioUnitario(), i.getSubtotal()))
                        .toList(),
                pedido.getSubtotal(),
                pedido.getDescuento(),
                pedido.getTotal(),
                pedido.getCodigoCupon());
    }

    static PedidoResponseDTO respuestaDeOtDelErp(SeguimientoOrden ot) {
        List<ItemPedidoDTO> items = Optional.ofNullable(ot.servicios()).orElse(List.of()).stream()
                .map(s -> new ItemPedidoDTO(TipoItemTienda.SERVICIO, s.idServicio(), null, s.nombre(), 1, s.precio(),
                        s.precio()))
                .toList();
        return new PedidoResponseDTO(
                null,
                ORIGEN_ERP,
                ot.idOrdenTrabajo(),
                ot.codigoSeguimiento(),
                ot.fechaIngreso() != null ? ot.fechaIngreso().atZone(ZONA_ERP).toOffsetDateTime() : null,
                ot.estado(),
                ot.estadoEtiqueta(),
                true,
                hitos(ot),
                ot.cuadrilla(),
                ot.fechaActualizacionEstado(),
                ot.fechaCierre(),
                null, null, null,
                items,
                ot.totalManoObra(),
                BigDecimal.ZERO,
                ot.totalManoObra(),
                null);
    }

    private static List<HitoDTO> hitos(SeguimientoOrden ot) {
        if (ot == null || ot.hitos() == null) {
            return List.of();
        }
        return ot.hitos().stream()
                .map(h -> new HitoDTO(h.estado(), h.etiqueta(), h.descripcion(), h.completado(), h.actual()))
                .toList();
    }

    /**
     * Avance armado con el último estado conocido (mismo criterio que
     * ms-workorders).
     */
    static List<HitoDTO> hitosSegunEstado(String estado) {
        if (estado == null) {
            return List.of();
        }
        if ("CANCELADA".equals(estado)) {
            return List.of(
                    new HitoDTO("CREADA", "Orden creada", "Solicitud recibida por la central", true, false),
                    new HitoDTO("CANCELADA", "Cancelada", "La orden fue cancelada", true, true));
        }
        int actual = 0;
        for (int i = 0; i < FLUJO_HITOS.size(); i++) {
            if (FLUJO_HITOS.get(i).estado().equals(estado)) {
                actual = i;
            }
        }
        boolean cerrada = "CERRADA".equals(estado);
        List<HitoDTO> hitos = new ArrayList<>();
        for (int i = 0; i < FLUJO_HITOS.size(); i++) {
            HitoDTO h = FLUJO_HITOS.get(i);
            hitos.add(new HitoDTO(h.estado(), h.etiqueta(), h.descripcion(), i < actual || cerrada, i == actual));
        }
        return hitos;
    }

    private static String etiquetaDeEstado(String estado) {
        if ("CANCELADA".equals(estado)) {
            return "Cancelada";
        }
        return FLUJO_HITOS.stream().filter(h -> h.estado().equals(estado))
                .map(HitoDTO::etiqueta).findFirst().orElse(null);
    }

    private static boolean tieneTexto(String s) {
        return s != null && !s.isBlank();
    }

    private static String textoOpcional(String s) {
        return tieneTexto(s) ? s.strip() : null;
    }

    record Linea(TipoItemTienda tipo, Long id, String codigo, String nombre, int cantidad, BigDecimal precioUnitario) {
        BigDecimal subtotal() {
            return precioUnitario.multiply(BigDecimal.valueOf(cantidad));
        }
    }
}

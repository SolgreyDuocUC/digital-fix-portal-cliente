package df.portal.cl.services.Order;

import df.portal.cl.config.PortalProperties;
import df.portal.cl.dto.Order.PedidoCreateDTO;
import df.portal.cl.dto.Order.PedidoResponseDTO;
import df.portal.cl.exceptions.NegocioException;
import df.portal.cl.exceptions.ServicioExternoException;
import df.portal.cl.model.cupones.Cupon;
import df.portal.cl.model.cupones.TipoDescuento;
import df.portal.cl.model.pedidos.Pedido;
import df.portal.cl.model.productos.ProductoTienda;
import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.model.usuarios.RolUsuario;
import df.portal.cl.model.usuarios.Usuario;
import df.portal.cl.remote.catalogo.CatalogoClient;
import df.portal.cl.remote.catalogo.CatalogoDtos.VerifyAndHoldRequest;
import df.portal.cl.remote.catalogo.CatalogoDtos.VerifyAndHoldResponse;
import df.portal.cl.remote.ordenes.OrdenesDtos.OrdenPortalRequest;
import df.portal.cl.remote.ordenes.OrdenesDtos.SeguimientoOrden;
import df.portal.cl.remote.ordenes.OrdenesTrabajoClient;
import df.portal.cl.repository.CuponRepository;
import df.portal.cl.repository.PedidoRepository;
import df.portal.cl.services.Product.ProductService;
import df.portal.cl.services.Promo.PromoService;
import df.portal.cl.services.User.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OrderServiceImplTest {

    @Mock UserService userService;
    @Mock ProductService productService;
    @Mock PromoService promoService;
    @Mock CatalogoClient catalogoClient;
    @Mock OrdenesTrabajoClient ordenesTrabajoClient;
    @Mock PedidoRepository pedidoRepository;
    @Mock CuponRepository cuponRepository;
    @Mock TransactionTemplate transactionTemplate;

    OrderServiceImpl service;
    Usuario cliente;

    @BeforeEach
    void preparar() {
        var props = new PortalProperties(List.of(), null, false, new PortalProperties.Stock(30), null);
        service = new OrderServiceImpl(userService, productService, promoService, catalogoClient, ordenesTrabajoClient,
                pedidoRepository, cuponRepository, transactionTemplate, props);

        cliente = Usuario.builder().idUsuario(1L).email("cliente@correo.cl").nombre("Andrea").apellidos("Rojas")
                .razonSocial("Comercial Rojas SpA").rut("76.543.210-3").telefono("+56987654321")
                .idComuna(13101L).rol(RolUsuario.ROLE_CLIENTE).activo(true).build();
        when(userService.obtenerEntidad(1L)).thenReturn(cliente);

        // Repuesto: precio ERP 10.000 con 20 % de descuento de tienda → 8.000. Servicio: 45.000.
        when(productService.itemVendible(TipoItemTienda.REPUESTO, 7L)).thenReturn(ProductoTienda.builder()
                .tipoItem(TipoItemTienda.REPUESTO).idMicroservicio(7L).codigo("REP-0007").nombreBase("Interruptor 2x16A")
                .precioBase(new BigDecimal("10000")).descuentoPorcentaje(20).stockDisponible(5).visibleEnTienda(true).build());
        when(productService.itemVendible(TipoItemTienda.SERVICIO, 3L)).thenReturn(ProductoTienda.builder()
                .tipoItem(TipoItemTienda.SERVICIO).idMicroservicio(3L).codigo("SRV-0003").nombreBase("Revisión de tablero")
                .precioBase(new BigDecimal("45000")).visibleEnTienda(true).build());

        doAnswer(inv -> {
            Consumer<TransactionStatus> accion = inv.getArgument(0);
            accion.accept(null);
            return null;
        }).when(transactionTemplate).executeWithoutResult(any());
    }

    @Test
    void crear_ReservaStockCreaLaOtYGuardaElPedidoConPreciosDelErp() {
        when(catalogoClient.verificarYReservar(any())).thenReturn(holdExitoso());
        when(ordenesTrabajoClient.crearOrden(any())).thenReturn(ot(501L, "CREADA"));

        PedidoResponseDTO respuesta = service.crear(1L, pedido(2, null));

        // Reserva de stock solo para los repuestos, referenciada con el código del pedido.
        ArgumentCaptor<VerifyAndHoldRequest> hold = ArgumentCaptor.forClass(VerifyAndHoldRequest.class);
        verify(catalogoClient).verificarYReservar(hold.capture());
        assertThat(hold.getValue().items()).singleElement().satisfies(i -> {
            assertThat(i.idRepuesto()).isEqualTo(7L);
            assertThat(i.cantidad()).isEqualTo(2);
        });
        assertThat(hold.getValue().minutosReserva()).isEqualTo(30);

        // La OT lleva al cliente por RUT, el servicio y los repuestos con la reserva.
        ArgumentCaptor<OrdenPortalRequest> orden = ArgumentCaptor.forClass(OrdenPortalRequest.class);
        verify(ordenesTrabajoClient).crearOrden(orden.capture());
        assertThat(orden.getValue().cliente().rut()).isEqualTo("76.543.210-3");
        assertThat(orden.getValue().cliente().nombre()).isEqualTo("Comercial Rojas SpA");
        assertThat(orden.getValue().servicios()).containsExactly(3L);
        assertThat(orden.getValue().repuestos()).singleElement().satisfies(r -> assertThat(r.cantidad()).isEqualTo(2));
        assertThat(orden.getValue().tokenReservaStock()).isEqualTo("HOLD-ABC12345");
        assertThat(orden.getValue().direccion().idComuna()).isEqualTo(13101L);

        // 2 × 8.000 + 45.000 = 61.000
        ArgumentCaptor<Pedido> guardado = ArgumentCaptor.forClass(Pedido.class);
        verify(pedidoRepository).save(guardado.capture());
        assertThat(guardado.getValue().getTotal()).isEqualByComparingTo("61000");
        assertThat(guardado.getValue().getIdOrdenTrabajo()).isEqualTo(501L);

        assertThat(respuesta.codigoSeguimiento()).isEqualTo("OT-501");
        assertThat(respuesta.estado()).isEqualTo("CREADA");
        assertThat(respuesta.codigo()).startsWith("PED-");
        verify(catalogoClient, never()).liberarReservaSilenciosamente(any());
    }

    @Test
    void crear_ConCupon_DescuentaYRegistraElUso() {
        Cupon cupon = Cupon.builder().idCupon(9L).codigo("BIENVENIDA10").tipo(TipoDescuento.PORCENTAJE)
                .valor(BigDecimal.TEN).fechaInicio(LocalDate.now()).fechaFin(LocalDate.now()).activo(true).build();
        when(promoService.obtenerAplicable(eq("bienvenida10"), any())).thenReturn(cupon);
        when(cuponRepository.findById(9L)).thenReturn(Optional.of(cupon));
        when(catalogoClient.verificarYReservar(any())).thenReturn(holdExitoso());
        when(ordenesTrabajoClient.crearOrden(any())).thenReturn(ot(502L, "CREADA"));

        PedidoResponseDTO respuesta = service.crear(1L, pedido(2, "bienvenida10"));

        assertThat(respuesta.descuento()).isEqualByComparingTo("6100");
        assertThat(respuesta.total()).isEqualByComparingTo("54900");
        assertThat(cupon.getUsosActuales()).isEqualTo(1);
    }

    @Test
    void crear_SiMsWorkordersFalla_LiberaLaReservaYNoGuardaNada() {
        when(catalogoClient.verificarYReservar(any())).thenReturn(holdExitoso());
        when(ordenesTrabajoClient.crearOrden(any()))
                .thenThrow(ServicioExternoException.noDisponible("La central de órdenes (ms-workorders)"));

        assertThatThrownBy(() -> service.crear(1L, pedido(1, null)))
                .isInstanceOf(ServicioExternoException.class)
                .extracting(e -> ((NegocioException) e).getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);

        verify(catalogoClient).liberarReservaSilenciosamente("HOLD-ABC12345");
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void crear_SinStock_Responde409ConDetalleYNoCreaLaOt() {
        when(catalogoClient.verificarYReservar(any())).thenReturn(new VerifyAndHoldResponse(false, false, null, null,
                "Stock insuficiente", List.of(new VerifyAndHoldResponse.DetalleHold(7L, "Interruptor 2x16A", 2, 1, false))));

        assertThatThrownBy(() -> service.crear(1L, pedido(2, null)))
                .isInstanceOf(NegocioException.class)
                .satisfies(e -> {
                    assertThat(((NegocioException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(((NegocioException) e).getDetalles()).containsExactly("Interruptor 2x16A: pediste 2, hay 1");
                });
        verify(ordenesTrabajoClient, never()).crearOrden(any());
    }

    @Test
    void crear_ServicioConCantidadMayorAUno_EsInvalido() {
        var dto = new PedidoCreateDTO(List.of(new PedidoCreateDTO.ItemDTO(TipoItemTienda.SERVICIO, 3L, 2)),
                direccion(), null, null, null);

        assertThatThrownBy(() -> service.crear(1L, dto))
                .isInstanceOf(NegocioException.class)
                .hasMessageContaining("cantidad 1");
        verifyNoInteractions(catalogoClient, ordenesTrabajoClient);
    }

    @Test
    void misPedidos_IncluyeOtCreadasPorLaCentralYMarcaSinConexion() {
        when(pedidoRepository.findByUsuario_IdUsuarioOrderByFechaCreacionDesc(1L)).thenReturn(List.of());
        when(ordenesTrabajoClient.ordenesDelCliente("76.543.210-3")).thenReturn(List.of(ot(77L, "ASIGNADA")));

        List<PedidoResponseDTO> pedidos = service.misPedidos(1L);
        assertThat(pedidos).singleElement().satisfies(p -> {
            assertThat(p.origen()).isEqualTo("ERP");
            assertThat(p.codigoSeguimiento()).isEqualTo("OT-77");
            assertThat(p.estado()).isEqualTo("ASIGNADA");
        });

        when(ordenesTrabajoClient.ordenesDelCliente(any()))
                .thenThrow(ServicioExternoException.noDisponible("ms-workorders"));
        assertThat(service.misPedidos(1L)).isEmpty();
    }

    // ---------------------------------------------------------------------

    private static PedidoCreateDTO pedido(int cantidadRepuesto, String cupon) {
        return new PedidoCreateDTO(
                List.of(new PedidoCreateDTO.ItemDTO(TipoItemTienda.REPUESTO, 7L, cantidadRepuesto),
                        new PedidoCreateDTO.ItemDTO(TipoItemTienda.SERVICIO, 3L, 1)),
                direccion(), "Lunes AM", "Tablero se calienta", cupon);
    }

    private static PedidoCreateDTO.DireccionDTO direccion() {
        return new PedidoCreateDTO.DireccionDTO("Av. Providencia", "1234", "Of. 501", null, null, null, "Providencia");
    }

    private static VerifyAndHoldResponse holdExitoso() {
        return new VerifyAndHoldResponse(true, true, "HOLD-ABC12345", Instant.now().plusSeconds(1800), "OK", List.of());
    }

    private static SeguimientoOrden ot(Long id, String estado) {
        return new SeguimientoOrden(id, "OT-" + id, estado, "Orden creada", LocalDateTime.now(), LocalDateTime.now(), null,
                null, List.of(new SeguimientoOrden.Hito(estado, "Orden creada", "", true, true)), List.of(),
                new BigDecimal("45000"));
    }
}

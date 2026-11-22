package df.portal.cl.services.Product;

import df.portal.cl.dto.productos.ProductoPublicoDTO;
import df.portal.cl.dto.productos.ProductoTiendaDTO;
import df.portal.cl.dto.productos.VincularImagenDriveRequest;
import df.portal.cl.exceptions.NegocioException;
import df.portal.cl.model.productos.ProductoTienda;
import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.remote.catalogo.CatalogoClient;
import df.portal.cl.remote.catalogo.CatalogoDtos.ProductoCatalogo;
import df.portal.cl.remote.ordenes.OrdenesDtos.ServicioRemoto;
import df.portal.cl.remote.ordenes.OrdenesTrabajoClient;
import df.portal.cl.repository.ProductoTiendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Las lecturas no son transaccionales a propósito: las filas de ProductoTienda llegan desacopladas
 * del EntityManager, así que copiarles los datos del ERP en memoria nunca termina en un UPDATE.
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    static final String CATEGORIA_SERVICIOS = "Servicios técnicos";

    private final CatalogoClient catalogoClient;
    private final OrdenesTrabajoClient ordenesTrabajoClient;
    private final ProductoTiendaRepository productoTiendaRepository;

    @Override
    public List<ProductoPublicoDTO> listarRepuestos(String busqueda, String categoria, boolean soloEnStock) {
        return repuestosCombinados().stream()
                .filter(ProductoTienda::isVisibleEnTienda)
                .filter(p -> !soloEnStock || p.tieneStockDisponible())
                .filter(p -> categoria == null || categoria.isBlank()
                        || contiene(p.getCategoriaTienda(), categoria))
                .filter(p -> coincide(p, busqueda))
                .sorted(ordenTienda())
                .map(ProductoPublicoDTO::from)
                .toList();
    }

    @Override
    public ProductoPublicoDTO obtenerRepuesto(Long idRepuesto) {
        ProductoTienda p = repuesto(idRepuesto);
        if (!p.isVisibleEnTienda()) {
            throw NegocioException.noEncontrado("No existe el producto " + idRepuesto);
        }
        return ProductoPublicoDTO.from(p);
    }

    @Override
    public List<ProductoPublicoDTO> listarServicios(String busqueda) {
        return serviciosCombinados().stream()
                .filter(ProductoTienda::isVisibleEnTienda)
                .filter(p -> coincide(p, busqueda))
                .sorted(ordenTienda())
                .map(ProductoPublicoDTO::from)
                .toList();
    }

    @Override
    public List<String> listarCategorias() {
        return repuestosCombinados().stream()
                .filter(ProductoTienda::isVisibleEnTienda)
                .map(ProductoTienda::getCategoriaTienda)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
    }

    @Override
    public ProductoTienda itemVendible(TipoItemTienda tipo, Long idMicroservicio) {
        ProductoTienda item = tipo == TipoItemTienda.REPUESTO
                ? repuesto(idMicroservicio)
                : serviciosCombinados().stream()
                        .filter(s -> s.getIdMicroservicio().equals(idMicroservicio))
                        .findFirst()
                        .orElseThrow(() -> NegocioException.noEncontrado(
                                "El servicio " + idMicroservicio + " no existe o ya no está disponible"));
        if (!item.isVisibleEnTienda()) {
            throw NegocioException.invalido("\"" + item.getNombreParaMostrar() + "\" ya no está a la venta en la tienda");
        }
        return item;
    }

    @Override
    public List<ProductoTiendaDTO> listarParaMarketing() {
        return Stream.concat(repuestosCombinados().stream(), serviciosCombinados().stream())
                .sorted(Comparator.comparing(ProductoTienda::getTipoItem).thenComparing(ProductoTienda::getCodigo,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(ProductoTiendaDTO::from)
                .toList();
    }

    // Sin @Transactional: save() tiene su propia transacción y la entidad queda desacoplada después,
    // así completar la marca y la categoría del ERP para la respuesta no se guarda como dato de Marketing.
    @Override
    public ProductoTiendaDTO actualizarDatosTienda(TipoItemTienda tipo, Long idMicroservicio, VincularImagenDriveRequest request) {
        // Primero se confirma que el ítem existe en el ERP (404 si no) y se obtienen sus datos base.
        ProductoTienda base = itemDelErp(tipo, idMicroservicio);

        ProductoTienda capa = productoTiendaRepository.findByTipoItemAndIdMicroservicio(tipo, idMicroservicio)
                .orElseGet(() -> nuevaCapa(tipo, idMicroservicio));
        capa.setCodigo(base.getCodigo());
        capa.sincronizarDesdeMicroservicio(base.getNombreBase(), base.getDescripcionBase(),
                base.getPrecioBase(), base.getStockDisponible());
        capa.setUnidadMedida(base.getUnidadMedida());
        capa.setCertificacionSEC(base.isCertificacionSEC());

        try {
            capa.vincularImagenGoogleDrive(request.imagenDriveUrl());
        } catch (IllegalArgumentException ex) {
            throw NegocioException.invalido(ex.getMessage());
        }
        if (request.descuentoPorcentaje() != null
                && (request.descuentoPorcentaje() < 0 || request.descuentoPorcentaje() > 90)) {
            throw NegocioException.invalido("El descuento debe estar entre 0 y 90 %");
        }
        capa.actualizarMarketing(
                request.nombreComercial(),
                request.descripcionComercial(),
                request.categoriaTienda(),
                request.badgePromocional(),
                request.descuentoPorcentaje(),
                request.destacado() != null ? request.destacado() : capa.isDestacado(),
                request.visibleEnTienda() != null ? request.visibleEnTienda() : capa.isVisibleEnTienda());

        ProductoTienda guardada = productoTiendaRepository.save(capa);
        guardada.setMarca(base.getMarca());
        if (guardada.getCategoriaTienda() == null) {
            guardada.setCategoriaTienda(base.getCategoriaBase());
        }
        return ProductoTiendaDTO.from(guardada);
    }

    // ---------------------------------------------------------------------
    // Combinación ERP + capa comercial
    // ---------------------------------------------------------------------

    private List<ProductoTienda> repuestosCombinados() {
        Map<Long, ProductoTienda> capas = capas(TipoItemTienda.REPUESTO);
        return catalogoClient.listarProductos().stream()
                .map(r -> combinar(desdeRepuesto(r), capas.get(r.id())))
                .toList();
    }

    private List<ProductoTienda> serviciosCombinados() {
        Map<Long, ProductoTienda> capas = capas(TipoItemTienda.SERVICIO);
        return ordenesTrabajoClient.listarServicios().stream()
                .map(s -> combinar(desdeServicio(s), capas.get(s.idServicio())))
                .toList();
    }

    private ProductoTienda repuesto(Long idRepuesto) {
        Optional<ProductoTienda> capa = productoTiendaRepository
                .findByTipoItemAndIdMicroservicio(TipoItemTienda.REPUESTO, idRepuesto);
        return combinar(itemDelErp(TipoItemTienda.REPUESTO, idRepuesto), capa.orElse(null));
    }

    private ProductoTienda itemDelErp(TipoItemTienda tipo, Long id) {
        if (tipo == TipoItemTienda.SERVICIO) {
            return ordenesTrabajoClient.listarServicios().stream()
                    .filter(s -> s.idServicio().equals(id))
                    .findFirst()
                    .map(ProductServiceImpl::desdeServicio)
                    .orElseThrow(() -> NegocioException.noEncontrado("No existe un servicio activo con id " + id));
        }
        try {
            return desdeRepuesto(catalogoClient.obtenerProducto(id));
        } catch (NegocioException ex) {
            if (ex.getStatus() == HttpStatus.NOT_FOUND) {
                throw NegocioException.noEncontrado("No existe un repuesto activo con id " + id);
            }
            throw ex;
        }
    }

    private Map<Long, ProductoTienda> capas(TipoItemTienda tipo) {
        return productoTiendaRepository.findByTipoItem(tipo).stream()
                .collect(Collectors.toMap(ProductoTienda::getIdMicroservicio, Function.identity(), (a, b) -> a));
    }

    /** La capa de Marketing recibe los datos vigentes del ERP; sin capa, el ítem se muestra tal cual. */
    static ProductoTienda combinar(ProductoTienda delErp, ProductoTienda capa) {
        if (capa == null) {
            delErp.setCategoriaTienda(delErp.getCategoriaBase());
            return delErp;
        }
        capa.setCodigo(delErp.getCodigo());
        capa.sincronizarDesdeMicroservicio(delErp.getNombreBase(), delErp.getDescripcionBase(),
                delErp.getPrecioBase(), delErp.getStockDisponible());
        capa.setUnidadMedida(delErp.getUnidadMedida());
        capa.setCertificacionSEC(delErp.isCertificacionSEC());
        capa.setMarca(delErp.getMarca());
        capa.setCategoriaBase(delErp.getCategoriaBase());
        if (capa.getCategoriaTienda() == null || capa.getCategoriaTienda().isBlank()) {
            capa.setCategoriaTienda(delErp.getCategoriaBase());
        }
        return capa;
    }

    static ProductoTienda desdeRepuesto(ProductoCatalogo r) {
        return ProductoTienda.builder()
                .idMicroservicio(r.id())
                .tipoItem(TipoItemTienda.REPUESTO)
                .codigo(r.codigo())
                .nombreBase(r.nombre())
                .descripcionBase(r.descripcion())
                .precioBase(r.precio())
                // "stock" de ms-catalog ya descuenta las reservas activas de otros carritos.
                .stockDisponible(r.disponible() ? r.stock() : 0)
                .unidadMedida(r.unidadMedida())
                .certificacionSEC(r.certificacionSEC())
                .marca(r.marca())
                .categoriaBase(r.categoria())
                .visibleEnTienda(true)
                .build();
    }

    static ProductoTienda desdeServicio(ServicioRemoto s) {
        return ProductoTienda.builder()
                .idMicroservicio(s.idServicio())
                .tipoItem(TipoItemTienda.SERVICIO)
                .codigo(s.codigo())
                .nombreBase(s.nombre())
                .descripcionBase(s.descripcion())
                .precioBase(s.tarifa())
                .unidadMedida("VISITA")
                .categoriaBase(CATEGORIA_SERVICIOS)
                .visibleEnTienda(true)
                .build();
    }

    private static ProductoTienda nuevaCapa(TipoItemTienda tipo, Long idMicroservicio) {
        return ProductoTienda.builder()
                .tipoItem(tipo)
                .idMicroservicio(idMicroservicio)
                .visibleEnTienda(true)
                .build();
    }

    // Destacados primero, luego por nombre.
    private static Comparator<ProductoTienda> ordenTienda() {
        return Comparator.comparing(ProductoTienda::isDestacado).reversed()
                .thenComparing(ProductoTienda::getNombreParaMostrar, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
    }

    private static boolean coincide(ProductoTienda p, String busqueda) {
        if (busqueda == null || busqueda.isBlank()) {
            return true;
        }
        return contiene(p.getNombreParaMostrar(), busqueda)
                || contiene(p.getDescripcionParaMostrar(), busqueda)
                || contiene(p.getCodigo(), busqueda);
    }

    private static boolean contiene(String texto, String buscado) {
        return texto != null && texto.toLowerCase(Locale.ROOT).contains(buscado.strip().toLowerCase(Locale.ROOT));
    }
}

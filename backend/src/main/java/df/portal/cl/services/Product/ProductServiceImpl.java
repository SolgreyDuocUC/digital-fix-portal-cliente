package df.portal.cl.services.Product;

import df.portal.cl.exceptions.NegocioException;
import df.portal.cl.model.productos.ProductoTienda;
import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.remote.catalogo.CatalogoClient;
import df.portal.cl.remote.catalogo.CatalogoDtos.ProductoCatalogo;
import df.portal.cl.remote.ordenes.OrdenesDtos.ServicioRemoto;
import df.portal.cl.remote.ordenes.OrdenesTrabajoClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementación mínima de ProductService.
 *
 * Solo se usa durante el checkout para obtener el precio real del ERP y validar disponibilidad.
 * El catálogo público ya no pasa por aquí: el frontend consulta ms-catalog directamente.
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final CatalogoClient catalogoClient;
    private final OrdenesTrabajoClient ordenesTrabajoClient;

    @Override
    public ProductoTienda itemVendible(TipoItemTienda tipo, Long idMicroservicio) {
        return switch (tipo) {
            case REPUESTO -> repuestoVendible(idMicroservicio);
            case SERVICIO -> servicioVendible(idMicroservicio);
        };
    }

    // ── Repuesto (ms-catalog) ────────────────────────────────────────────────

    private ProductoTienda repuestoVendible(Long id) {
        ProductoCatalogo p = catalogoClient.obtenerProducto(id);
        if (p == null || !p.disponible()) {
            throw NegocioException.noEncontrado("El repuesto " + id + " no está disponible");
        }
        return ProductoTienda.builder()
                .tipoItem(TipoItemTienda.REPUESTO)
                .idMicroservicio(id)
                .codigo(p.codigo())
                .nombreBase(p.nombre())
                .precioBase(p.precio())
                .stockDisponible(p.stock() != null ? p.stock() : 0)
                .visibleEnTienda(true)
                .build();
    }

    // ── Servicio técnico (ms-workorders) ─────────────────────────────────────

    private ProductoTienda servicioVendible(Long id) {
        List<ServicioRemoto> servicios = ordenesTrabajoClient.listarServicios();
        ServicioRemoto s = servicios.stream()
                .filter(sv -> id.equals(sv.idServicio()))
                .findFirst()
                .orElseThrow(() -> NegocioException.noEncontrado("El servicio " + id + " no está disponible"));
        return ProductoTienda.builder()
                .tipoItem(TipoItemTienda.SERVICIO)
                .idMicroservicio(id)
                .codigo(s.codigo())
                .nombreBase(s.nombre())
                .precioBase(s.tarifa())
                .stockDisponible(null)
                .visibleEnTienda(true)
                .build();
    }
}

package df.portal.cl.services.Product;

import df.portal.cl.dto.productos.ProductoPublicoDTO;
import df.portal.cl.dto.productos.ProductoTiendaDTO;
import df.portal.cl.dto.productos.VincularImagenDriveRequest;
import df.portal.cl.model.productos.ProductoTienda;
import df.portal.cl.model.productos.TipoItemTienda;

import java.util.List;

/**
 * Catálogo de la tienda. No tiene productos propios: combina en cada consulta el catálogo del ERP
 * (repuestos de ms-catalog, servicios de ms-workorders) con la capa comercial que gestiona Marketing.
 */
public interface ProductService {

    List<ProductoPublicoDTO> listarRepuestos(String busqueda, String categoria, boolean soloEnStock);

    ProductoPublicoDTO obtenerRepuesto(Long idRepuesto);

    List<ProductoPublicoDTO> listarServicios(String busqueda);

    List<String> listarCategorias();

    /** Ítem con precio vigente (del ERP + descuento de tienda) para cobrarlo en un pedido. 404 si no se vende. */
    ProductoTienda itemVendible(TipoItemTienda tipo, Long idMicroservicio);

    // ---- Marketing ----

    /** Todos los ítems del ERP con su capa comercial, incluidos los ocultos en la tienda. */
    List<ProductoTiendaDTO> listarParaMarketing();

    ProductoTiendaDTO actualizarDatosTienda(TipoItemTienda tipo, Long idMicroservicio, VincularImagenDriveRequest request);
}

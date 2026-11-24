package df.portal.cl.services.Product;

import df.portal.cl.model.productos.ProductoTienda;
import df.portal.cl.model.productos.TipoItemTienda;

/**
 * Contrato mínimo para el checkout: obtiene el precio vigente del ERP y valida la disponibilidad
 * de un ítem antes de confirmar la orden. El catálogo público ya no pasa por el backend del portal
 * (el frontend consulta ms-catalog directamente vía proxy Vite / VITE_MS_CATALOG_URL).
 */
public interface ProductService {

    /**
     * Devuelve el ítem vendible (repuesto o servicio) con su precio real del ERP.
     * Lanza {@code NegocioException} si el ítem no existe o no está activo.
     */
    ProductoTienda itemVendible(TipoItemTienda tipo, Long idMicroservicio);
}


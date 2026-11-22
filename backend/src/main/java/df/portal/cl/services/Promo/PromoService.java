package df.portal.cl.services.Promo;

import df.portal.cl.dto.Promo.CuponDTO;
import df.portal.cl.dto.Promo.CuponRequest;
import df.portal.cl.dto.Promo.ValidacionCuponDTO;
import df.portal.cl.model.cupones.Cupon;

import java.math.BigDecimal;
import java.util.List;

/**
 * Cupones pre-aprobados por Marketing. Solo descuentan sobre el total del pedido en el portal:
 * nunca cambian los precios del ERP.
 */
public interface PromoService {

    /** Prueba un cupón contra un subtotal; no lo consume. */
    ValidacionCuponDTO validar(String codigo, BigDecimal subtotal);

    /** Cupón aplicable a este subtotal, o 400 con el motivo. Lo usa el checkout. */
    Cupon obtenerAplicable(String codigo, BigDecimal subtotal);

    // ---- Marketing ----
    List<CuponDTO> listar();

    CuponDTO crear(CuponRequest request);

    CuponDTO actualizar(Long id, CuponRequest request);

    /** Los cupones no se borran (quedan en el historial de pedidos): se desactivan. */
    void desactivar(Long id);
}

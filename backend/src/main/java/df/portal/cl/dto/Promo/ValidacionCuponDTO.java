package df.portal.cl.dto.Promo;

import java.math.BigDecimal;

/** Resultado de probar un cupón contra el subtotal del carrito (no lo consume). */
public record ValidacionCuponDTO(
        String codigo,
        boolean valido,
        String mensaje,
        BigDecimal descuento,
        BigDecimal totalConDescuento
) {
}

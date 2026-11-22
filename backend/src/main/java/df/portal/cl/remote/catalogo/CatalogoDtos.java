package df.portal.cl.remote.catalogo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Contratos B2C de ms-catalog (paquete dto.b2c del microservicio). Se copian aquí en vez de
 * compartir una librería para que cada servicio pueda desplegarse por separado.
 */
public final class CatalogoDtos {

    private CatalogoDtos() {
    }

    /** GET /api/catalog/products y /{id}. "stock" ya descuenta las reservas activas. */
    public record ProductoCatalogo(
            Long id,
            String codigo,
            String nombre,
            String descripcion,
            String categoria,
            BigDecimal precio,
            Integer stock,
            boolean disponible,
            String unidadMedida,
            boolean certificacionSEC,
            String marca
    ) {
    }

    /** POST /api/catalog/stock/verify-and-hold */
    public record VerifyAndHoldRequest(String referencia, Integer minutosReserva, List<ItemHold> items) {
        public record ItemHold(Long idRepuesto, Integer cantidad) {
        }
    }

    public record VerifyAndHoldResponse(
            boolean exitoso,
            boolean disponible,
            String tokenReserva,
            Instant expiraEn,
            String mensaje,
            List<DetalleHold> detalles
    ) {
        public record DetalleHold(Long idRepuesto, String nombre, Integer cantidadSolicitada,
                                  Integer stockDisponibleReal, boolean disponible) {
        }
    }
}

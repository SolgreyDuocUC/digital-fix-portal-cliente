package df.portal.cl.dto.Promo;

import df.portal.cl.model.cupones.TipoDescuento;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CuponRequest(
        @NotBlank(message = "El código es obligatorio")
        @Pattern(regexp = "^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$", message = "El código solo admite letras, números y guiones (ej. ELECTRIC-SEC-10)")
        @Size(max = 40, message = "El código no puede exceder 40 caracteres")
        String codigo,

        @Size(max = 200, message = "La descripción no puede exceder 200 caracteres")
        String descripcion,

        @NotNull(message = "El tipo de descuento es obligatorio")
        TipoDescuento tipo,

        @NotNull(message = "El valor es obligatorio")
        @Positive(message = "El valor debe ser mayor a cero")
        BigDecimal valor,

        @PositiveOrZero(message = "El monto mínimo no puede ser negativo")
        BigDecimal montoMinimo,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate fechaInicio,

        @NotNull(message = "La fecha de término es obligatoria")
        LocalDate fechaFin,

        @Positive(message = "El límite de usos debe ser mayor a cero")
        Integer usosMaximos,

        Boolean activo
) {
}

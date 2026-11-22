package df.portal.cl.dto.Order;

import df.portal.cl.model.productos.TipoItemTienda;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

/**
 * Checkout del carrito. Los precios NO se reciben: el portal los toma del ERP (con el descuento de
 * tienda vigente) para que el cliente no pueda alterarlos desde el navegador.
 */
public record PedidoCreateDTO(

        @NotEmpty(message = "El carrito está vacío")
        @Size(max = 30, message = "Un pedido admite hasta 30 líneas")
        List<@Valid @NotNull ItemDTO> items,

        @NotNull(message = "La dirección de atención es obligatoria")
        @Valid
        DireccionDTO direccion,

        @Size(max = 120, message = "El horario preferido no puede exceder 120 caracteres")
        String horarioPreferido,

        @Size(max = 400, message = "Las notas no pueden exceder 400 caracteres")
        String notas,

        @Size(max = 40, message = "El código de cupón no puede exceder 40 caracteres")
        String codigoCupon
) {

    public record ItemDTO(
            @NotNull(message = "Indica si el ítem es REPUESTO o SERVICIO")
            TipoItemTienda tipo,

            @NotNull(message = "El id del producto es obligatorio")
            @Positive(message = "El id del producto no es válido")
            Long id,

            @NotNull(message = "La cantidad es obligatoria")
            @Positive(message = "La cantidad debe ser mayor a cero")
            @Max(value = 999, message = "La cantidad máxima por línea es 999")
            Integer cantidad
    ) {
    }

    /** Formato chileno de ms-workorders. La comuna sale de GET /api/v1/ubicaciones. */
    public record DireccionDTO(
            @NotBlank(message = "La calle es obligatoria")
            @Size(max = 120, message = "La calle no puede exceder 120 caracteres")
            String calle,

            @NotBlank(message = "El número es obligatorio")
            @Size(max = 10, message = "El número no puede exceder 10 caracteres")
            String numero,

            @Size(max = 60, message = "El depto u oficina no puede exceder 60 caracteres")
            String detalle,

            @Size(max = 200, message = "Las indicaciones no pueden exceder 200 caracteres")
            String referencia,

            @Pattern(regexp = "^\\s*\\d{3}-?\\d{4}\\s*$", message = "El código postal debe tener 7 dígitos")
            String codigoPostal,

            /** Si no viene, se usa la comuna del perfil del cliente. */
            @Positive(message = "La comuna no es válida")
            Long idComuna,

            @Size(max = 80) String comuna
    ) {
    }
}

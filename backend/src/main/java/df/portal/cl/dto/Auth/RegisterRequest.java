package df.portal.cl.dto.Auth;

import df.portal.cl.validations.RUN.ValidRun;
import jakarta.validation.constraints.*;

/**
 * Registro de un cliente (siempre ROLE_CLIENTE: los usuarios de Marketing y Ventas no se
 * auto-registran). El RUT es la llave con que el ERP lo reconocerá al recibir su primer pedido.
 */
public record RegisterRequest(
        @NotBlank(message = "El RUT es obligatorio")
        @ValidRun
        String rut,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 80, message = "El nombre no puede exceder 80 caracteres")
        String nombre,

        @Size(max = 80, message = "Los apellidos no pueden exceder 80 caracteres")
        String apellidos,

        /** Si el cliente es empresa o condominio; con esta razón social se registra en el ERP. */
        @Size(max = 150, message = "La razón social no puede exceder 150 caracteres")
        String razonSocial,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 254, message = "El correo no puede exceder 254 caracteres")
        String email,

        @NotBlank(message = "El teléfono es obligatorio")
        String telefono,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password,

        @Size(max = 200, message = "La dirección no puede exceder 200 caracteres")
        String direccion,

        @Positive(message = "La comuna no es válida")
        Long idComuna,

        @Size(max = 80) String comuna,
        @Size(max = 80) String region
) {
}

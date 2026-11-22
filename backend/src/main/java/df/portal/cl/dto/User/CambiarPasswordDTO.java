package df.portal.cl.dto.User;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CambiarPasswordDTO(
        @NotBlank(message = "La contraseña actual es obligatoria") String passwordActual,
        @NotBlank @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres") String passwordNueva,
        @NotBlank(message = "Confirma la contraseña nueva") String confirmacion
) {
}

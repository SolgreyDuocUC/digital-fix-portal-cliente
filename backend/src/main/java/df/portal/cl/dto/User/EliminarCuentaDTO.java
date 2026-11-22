package df.portal.cl.dto.User;

import jakarta.validation.constraints.NotBlank;

public record EliminarCuentaDTO(@NotBlank(message = "Confirma con tu contraseña") String password) {
}

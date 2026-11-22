package df.portal.cl.dto.resenias;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistrarAccionMejoraDTO(
        @NotBlank(message = "El plan de acción u oportunidad de mejora es obligatorio")
        @Size(max = 1000, message = "El plan de acción no puede superar los 1000 caracteres")
        String planAccionMejora,

        String usuarioAccionMejora
) {
}


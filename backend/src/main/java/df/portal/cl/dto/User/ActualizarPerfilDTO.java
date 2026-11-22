package df.portal.cl.dto.User;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Campos opcionales: solo se cambian los que vienen. El RUT y el correo no se modifican. */
public record ActualizarPerfilDTO(
        @Size(max = 80) String nombre,
        @Size(max = 80) String apellidos,
        @Size(max = 150) String razonSocial,
        String telefono,
        @Size(max = 200) String direccion,
        @Positive(message = "La comuna no es válida") Long idComuna,
        @Size(max = 80) String comuna,
        @Size(max = 80) String region
) {
}

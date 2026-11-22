package df.portal.cl.model.usuarios;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Entidad de Usuario del Portal (Cliente, Vendedor o Marketing).
 * Modelo desacoplado en español, fácil de mantener y auditable.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    private Long idUsuario;
    private String rut;
    private String nombre;
    private String apellidos;
    private String email;
    private String password;
    private String telefono;
    private String direccion;
    private String comuna;
    private String region;
    private String razonSocial; // En caso de ser empresa / condominio cliente
    private RolUsuario rol;
    private boolean activo;
    private OffsetDateTime fechaCreacion;
    private OffsetDateTime fechaActualizacion;

    public String getNombreCompleto() {
        if (apellidos == null || apellidos.isBlank()) {
            return nombre;
        }
        return nombre + " " + apellidos;
    }
}


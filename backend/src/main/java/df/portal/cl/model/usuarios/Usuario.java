package df.portal.cl.model.usuarios;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * Usuario del Portal (Cliente, Vendedor o Marketing). Identidad local, desacoplada del
 * Entra ID del ERP: la contraseña se guarda con BCrypt y el portal emite su propio JWT.
 *
 * El RUT es la llave con la que el portal se encuentra con el ERP: ms-workorders reutiliza o crea
 * al cliente por RUT al recibir el primer pedido.
 */
@Entity
@Table(name = "usuario_portal",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_usuario_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_usuario_rut", columnNames = "rut")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    /** Formato "12.345.678-5" (ver RutUtil). Obligatorio para clientes. */
    @Column(length = 12)
    private String rut;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(length = 80)
    private String apellidos;

    @Column(nullable = false, length = 254)
    private String email;

    /** Hash BCrypt; nunca la contraseña en claro. */
    @Column(nullable = false, length = 100)
    private String password;

    @Column(length = 20)
    private String telefono;

    /** Dirección de atención por defecto (texto libre) y su comuna en el catálogo de ms-workorders. */
    @Column(length = 200)
    private String direccion;

    private Long idComuna;

    @Column(length = 80)
    private String comuna;

    @Column(length = 80)
    private String region;

    /** En caso de ser empresa / condominio cliente. */
    @Column(length = 150)
    private String razonSocial;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolUsuario rol;

    private boolean activo;

    @Column(nullable = false)
    private OffsetDateTime fechaCreacion;

    private OffsetDateTime fechaActualizacion;

    /** Nombre con el que se identifica ante el ERP: la razón social si es empresa. */
    public String getNombreCompleto() {
        if (apellidos == null || apellidos.isBlank()) {
            return nombre;
        }
        return nombre + " " + apellidos;
    }

    public String getNombreParaErp() {
        return razonSocial != null && !razonSocial.isBlank() ? razonSocial : getNombreCompleto();
    }

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) {
            fechaCreacion = OffsetDateTime.now();
        }
    }

    @PreUpdate
    void alActualizar() {
        fechaActualizacion = OffsetDateTime.now();
    }
}

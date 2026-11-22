package df.portal.cl.model.resenias;

import df.portal.cl.model.productos.TipoItemTienda;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * Entidad JPA para la gestión de reseñas, calificaciones y auditoría de calidad de clientes.
 * Permite que los clientes califiquen productos y servicios técnicos, y que el equipo comercial
 * (Asistente de Marketing y Jefe de Ventas y Operaciones) audite críticas y registre oportunidades
 * de mejora operacional para cuadrillas en terreno.
 */
@Entity
@Table(name = "resenia_tienda", indexes = {
        @Index(name = "idx_resenia_item", columnList = "tipo_item, id_microservicio, estado"),
        @Index(name = "idx_resenia_categoria", columnList = "categoria, estado")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resenia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idResenia;

    /** ID del producto o servicio en el microservicio central (ms-catalog o ms-workorders). */
    @Column(name = "id_microservicio", nullable = false)
    private Long idMicroservicio;

    /** Tipo de ítem evaluado: SERVICIO en terreno o REPUESTO físico. */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_item", nullable = false, length = 20)
    private TipoItemTienda tipoItem;

    /** Código visible del ítem (ej: SRV-TAB-02, REP-DIF-25). */
    @Column(length = 30)
    private String codigoItem;

    /** Nombre del servicio o producto evaluado. */
    @Column(nullable = false, length = 150)
    private String nombreItem;

    /** ID de usuario registrado en el portal (opcional si es reseña de cliente invitado). */
    private Long idUsuario;

    /** Nombre visible del cliente que califica. */
    @Column(nullable = false, length = 100)
    private String nombreCliente;

    /** Comuna de residencia o atención donde se prestó el servicio eléctrico. */
    @Column(length = 80)
    private String comuna;

    /** Calificación de 1 a 5 estrellas. */
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer calificacion;

    /** Título breve u opinión destacada. */
    @Column(length = 120)
    private String titulo;

    /** Comentario detallado de la experiencia técnica o calidad del repuesto. */
    @Column(nullable = false, length = 1000)
    private String comentario;

    /** Clasificación automática o manual: FELICITACION, MEJORA o CRITICA. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private CategoriaResenia categoria;

    /** Estado de publicación en el e-commerce (PUBLICADA, PENDIENTE_MODERACION, OCULTA). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private EstadoResenia estado;

    /** Indica si el cliente cuenta con orden de trabajo o compra verificada en el portal. */
    @Column(nullable = false)
    private boolean compraVerificada;

    /**
     * Plan de acción correctivo u oportunidad de mejora operacional registrada por
     * el Jefe de Ventas y Operaciones o Asistente Comercial.
     */
    @Column(length = 1000)
    private String planAccionMejora;

    /** Nombre del usuario administrativo que registró el plan de acción de mejora. */
    @Column(length = 100)
    private String usuarioAccionMejora;

    /** Fecha y hora en la que se registró el plan de acción de mejora. */
    private OffsetDateTime fechaAccionMejora;

    /** Fecha de creación de la reseña. */
    @Column(nullable = false)
    private OffsetDateTime fechaCreacion;

    @PrePersist
    void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = OffsetDateTime.now();
        }
        if (estado == null) {
            estado = EstadoResenia.PUBLICADA;
        }
        if (categoria == null && calificacion != null) {
            categoria = CategoriaResenia.inferirPorEstrellas(calificacion);
        }
    }

    /**
     * Registra un plan de acción u oportunidad de mejora operacional sobre la reseña.
     */
    public void registrarMejoraOperacional(String planMejora, String usuarioAdmin) {
        this.planAccionMejora = planMejora;
        this.usuarioAccionMejora = usuarioAdmin;
        this.fechaAccionMejora = OffsetDateTime.now();
    }
}


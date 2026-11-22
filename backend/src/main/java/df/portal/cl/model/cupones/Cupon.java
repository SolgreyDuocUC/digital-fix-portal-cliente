package df.portal.cl.model.cupones;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Cupón pre-aprobado por Marketing. Regla de negocio: no modifica los precios del catálogo central
 * (ms-catalog / ms-workorders), solo descuenta sobre el total del pedido en el portal.
 */
@Entity
@Table(name = "cupon", uniqueConstraints = @UniqueConstraint(name = "uk_cupon_codigo", columnNames = "codigo"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCupon;

    /** En mayúsculas, ej. "ELECTRIC-SEC-10". */
    @Column(nullable = false, length = 40)
    private String codigo;

    @Column(length = 200)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoDescuento tipo;

    /** Porcentaje (1-100) o monto fijo en CLP, según el tipo. */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal valor;

    /** Subtotal mínimo del pedido para aplicar el cupón (opcional). */
    @Column(precision = 14, scale = 2)
    private BigDecimal montoMinimo;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalDate fechaFin;

    /** null = sin límite. */
    private Integer usosMaximos;

    @Column(nullable = false)
    private int usosActuales;

    private boolean activo;

    /** Evita que dos pedidos simultáneos superen el límite de usos. */
    @Version
    private Long version;

    private OffsetDateTime fechaCreacion;

    /** Motivo por el que el cupón no aplica hoy a este subtotal, o null si aplica. */
    public String motivoNoAplicable(BigDecimal subtotal, LocalDate hoy) {
        if (!activo) {
            return "El cupón " + codigo + " no está activo";
        }
        if (hoy.isBefore(fechaInicio)) {
            return "El cupón " + codigo + " es válido desde el " + fechaInicio;
        }
        if (hoy.isAfter(fechaFin)) {
            return "El cupón " + codigo + " venció el " + fechaFin;
        }
        if (usosMaximos != null && usosActuales >= usosMaximos) {
            return "El cupón " + codigo + " ya alcanzó su límite de usos";
        }
        if (montoMinimo != null && subtotal.compareTo(montoMinimo) < 0) {
            return "El cupón " + codigo + " requiere una compra mínima de $" + montoMinimo.setScale(0, RoundingMode.HALF_UP);
        }
        return null;
    }

    /** Descuento en CLP (entero), nunca mayor al subtotal. */
    public BigDecimal calcularDescuento(BigDecimal subtotal) {
        BigDecimal descuento = tipo == TipoDescuento.PORCENTAJE
                ? subtotal.multiply(valor).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP)
                : valor.setScale(0, RoundingMode.HALF_UP);
        return descuento.min(subtotal).max(BigDecimal.ZERO);
    }

    public void registrarUso() {
        usosActuales++;
    }

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) {
            fechaCreacion = OffsetDateTime.now();
        }
    }
}

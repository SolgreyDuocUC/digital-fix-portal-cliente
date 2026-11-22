package df.portal.cl.model.pedidos;

import df.portal.cl.model.usuarios.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Pedido confirmado por un cliente en el portal. Guarda lo que el ERP no conoce: el detalle
 * comercial (precios cobrados, cupón, descuento) y los repuestos pedidos. El estado técnico vive
 * en la Orden de Trabajo de ms-workorders (idOrdenTrabajo) y se consulta en vivo; aquí solo se
 * guarda el último conocido para mostrar algo si el ERP no responde.
 */
@Entity
@Table(name = "pedido", uniqueConstraints = @UniqueConstraint(name = "uk_pedido_codigo", columnNames = "codigo"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPedido;

    /** Código visible para el cliente, ej. "PED-7K2M9Q". */
    @Column(nullable = false, length = 20)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    /** OT creada en ms-workorders. */
    @Column(nullable = false)
    private Long idOrdenTrabajo;

    /** Último estado conocido de la OT (CREADA, ASIGNADA, ...). */
    @Column(nullable = false, length = 30)
    private String ultimoEstadoConocido;

    /** Reserva de stock obtenida en ms-catalog para los repuestos del pedido (si hubo). */
    @Column(length = 40)
    private String tokenReservaStock;

    // Dirección de atención
    @Column(nullable = false, length = 120)
    private String calle;

    @Column(nullable = false, length = 10)
    private String numero;

    @Column(length = 60)
    private String detalleDireccion;

    private Long idComuna;

    @Column(length = 80)
    private String comuna;

    @Column(length = 120)
    private String horarioPreferido;

    @Column(length = 400)
    private String notas;

    // Montos en CLP
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal descuento;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @Column(length = 40)
    private String codigoCupon;

    @Column(nullable = false)
    private OffsetDateTime fechaCreacion;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("idPedidoItem ASC")
    @Builder.Default
    private List<PedidoItem> items = new ArrayList<>();

    public void agregarItem(PedidoItem item) {
        item.setPedido(this);
        items.add(item);
    }

    public String direccionTexto() {
        String base = calle + " " + numero + (detalleDireccion != null && !detalleDireccion.isBlank() ? ", " + detalleDireccion : "");
        return comuna != null && !comuna.isBlank() ? base + ", " + comuna : base;
    }

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) {
            fechaCreacion = OffsetDateTime.now();
        }
    }
}

package df.portal.cl.model.pedidos;

import df.portal.cl.model.productos.TipoItemTienda;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/** Línea del pedido con el precio efectivamente cobrado (precio del ERP con el descuento de tienda vigente). */
@Entity
@Table(name = "pedido_item")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPedidoItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoItemTienda tipoItem;

    /** idRepuesto (ms-catalog) o idServicio (ms-workorders). */
    @Column(nullable = false)
    private Long idMicroservicio;

    @Column(length = 30)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal precioUnitario;

    public BigDecimal getSubtotal() {
        return precioUnitario.multiply(BigDecimal.valueOf(cantidad));
    }
}

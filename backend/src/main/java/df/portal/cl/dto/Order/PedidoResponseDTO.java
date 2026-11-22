package df.portal.cl.dto.Order;

import df.portal.cl.model.productos.TipoItemTienda;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Pedido del cliente con el seguimiento de su Orden de Trabajo.
 *
 * origen: PORTAL (comprado en la tienda) o ERP (OT que la central creó para este cliente: se muestra
 * para que vea todas sus atenciones, sin detalle comercial).
 * seguimientoEnVivo: false si ms-workorders no respondió; entonces "estado" es el último conocido.
 */
public record PedidoResponseDTO(
        String codigo,
        String origen,
        Long idOrdenTrabajo,
        String codigoSeguimiento,
        OffsetDateTime fechaCreacion,
        String estado,
        String estadoEtiqueta,
        boolean seguimientoEnVivo,
        List<HitoDTO> hitos,
        String cuadrilla,
        LocalDateTime fechaActualizacionEstado,
        LocalDateTime fechaCierre,
        String direccion,
        String horarioPreferido,
        String notas,
        List<ItemPedidoDTO> items,
        BigDecimal subtotal,
        BigDecimal descuento,
        BigDecimal total,
        String codigoCupon
) {

    public record HitoDTO(String estado, String etiqueta, String descripcion, boolean completado, boolean actual) {
    }

    public record ItemPedidoDTO(TipoItemTienda tipo, Long id, String codigo, String nombre, Integer cantidad,
                                BigDecimal precioUnitario, BigDecimal subtotal) {
    }
}

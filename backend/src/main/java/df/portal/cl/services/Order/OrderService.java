package df.portal.cl.services.Order;

import df.portal.cl.dto.Order.PedidoCreateDTO;
import df.portal.cl.dto.Order.PedidoResponseDTO;

import java.util.List;

/**
 * Pedidos del portal. El portal orquesta, el ERP ejecuta:
 *   precios del ERP → cupón → reserva de stock (ms-catalog) → Orden de Trabajo (ms-workorders) → pedido local.
 * El estado de cada pedido es el de su OT, consultado en vivo.
 */
public interface OrderService {

    PedidoResponseDTO crear(Long idUsuario, PedidoCreateDTO dto);

    /** Pedidos del portal y OT del ERP del cliente, más recientes primero. */
    List<PedidoResponseDTO> misPedidos(Long idUsuario);

    /** Por código de pedido ("PED-...") o de seguimiento de una OT del cliente ("OT-123"). */
    PedidoResponseDTO obtener(Long idUsuario, String codigo);
}

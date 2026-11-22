package df.portal.cl.controller.Order;

import df.portal.cl.dto.Order.PedidoCreateDTO;
import df.portal.cl.dto.Order.PedidoResponseDTO;
import df.portal.cl.security.UsuarioAutenticado;
import df.portal.cl.services.Order.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// El cliente sale siempre del token (el ejemplo One Tech aceptaba "?userId=" como respaldo, lo que
// permitía comprar o ver pedidos en nombre de otro).
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Checkout del cliente → Orden de Trabajo en ms-workorders, y su seguimiento en vivo")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Confirmar un pedido",
            description = "Toma los precios del ERP, aplica el cupón, reserva el stock de repuestos en ms-catalog y crea la "
                    + "Orden de Trabajo en ms-workorders (visible de inmediato en el portal de empleados). "
                    + "409 si falta stock; 503 si un microservicio no responde (en ese caso no queda nada a medias).")
    @PostMapping
    public ResponseEntity<PedidoResponseDTO> crear(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                   @Valid @RequestBody PedidoCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.crear(usuario.id(), dto));
    }

    @Operation(summary = "Mis pedidos", description = "Pedidos del portal y OT que la central creó para mí, con su estado en vivo.")
    @GetMapping("/my-orders")
    public ResponseEntity<List<PedidoResponseDTO>> misPedidos(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.ok(orderService.misPedidos(usuario.id()));
    }

    @Operation(summary = "Seguimiento de un pedido", description = "Por código de pedido (PED-...) o de seguimiento (OT-123).")
    @GetMapping("/{codigo}")
    public ResponseEntity<PedidoResponseDTO> obtener(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                     @PathVariable String codigo) {
        return ResponseEntity.ok(orderService.obtener(usuario.id(), codigo));
    }
}

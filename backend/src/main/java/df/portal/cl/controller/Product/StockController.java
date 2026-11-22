package df.portal.cl.controller.Product;

import df.portal.cl.remote.catalogo.CatalogoClient;
import df.portal.cl.remote.catalogo.CatalogoDtos.VerifyAndHoldRequest;
import df.portal.cl.remote.catalogo.CatalogoDtos.VerifyAndHoldResponse;
import df.portal.cl.config.PortalProperties;
import df.portal.cl.exceptions.NegocioException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Reserva temporal de stock para el carrito (POST /api/catalog/stock/verify-and-hold de ms-catalog).
 * Exige sesión de cliente: así nadie puede bloquear inventario de forma anónima. El checkout
 * (POST /api/v1/orders) ya reserva por su cuenta; esto sirve para avisar antes, al abrir el checkout.
 */
@Validated
@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
@Tag(name = "Stock", description = "Verificación y reserva temporal de repuestos en ms-catalog")
public class StockController {

    private static final int MAX_LINEAS = 30;
    private static final int MAX_CANTIDAD = 999;

    private final CatalogoClient catalogoClient;
    private final PortalProperties props;

    @Operation(summary = "Verificar y reservar stock",
            description = "Todo o nada. Responde 200 con exitoso=false y el detalle si falta stock.")
    @PostMapping("/verify-and-hold")
    public ResponseEntity<VerifyAndHoldResponse> verifyAndHold(@RequestBody VerifyAndHoldRequest request) {
        if (request.items() == null || request.items().isEmpty() || request.items().size() > MAX_LINEAS
                || request.items().stream().anyMatch(i -> i.idRepuesto() == null || i.cantidad() == null
                || i.cantidad() < 1 || i.cantidad() > MAX_CANTIDAD)) {
            throw NegocioException.invalido("Indica entre 1 y " + MAX_LINEAS + " repuestos con cantidades entre 1 y " + MAX_CANTIDAD);
        }
        // Los minutos los fija el portal, no el navegador.
        var acotada = new VerifyAndHoldRequest(request.referencia(), props.stock().minutosReserva(), request.items());
        return ResponseEntity.ok(catalogoClient.verificarYReservar(acotada));
    }

    @Operation(summary = "Liberar una reserva", description = "Al vaciar el carrito o abandonar el checkout.")
    @PostMapping("/release-hold")
    public ResponseEntity<Void> releaseHold(@RequestParam @NotBlank String tokenReserva) {
        catalogoClient.liberarReserva(tokenReserva);
        return ResponseEntity.noContent().build();
    }
}

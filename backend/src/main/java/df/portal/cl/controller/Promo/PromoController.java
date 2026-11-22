package df.portal.cl.controller.Promo;

import df.portal.cl.dto.Promo.CuponDTO;
import df.portal.cl.dto.Promo.CuponRequest;
import df.portal.cl.dto.Promo.ValidacionCuponDTO;
import df.portal.cl.services.Promo.PromoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/promo-codes")
@RequiredArgsConstructor
@Tag(name = "Cupones", description = "Validación para clientes y gestión de cupones pre-aprobados (Marketing)")
public class PromoController {

    private final PromoService promoService;

    @Operation(summary = "Probar un cupón contra el subtotal del carrito", description = "No consume el cupón; se aplica al confirmar el pedido.")
    @GetMapping("/{codigo}")
    public ResponseEntity<ValidacionCuponDTO> validar(@PathVariable String codigo,
                                                      @RequestParam(defaultValue = "0") @PositiveOrZero BigDecimal subtotal) {
        return ResponseEntity.ok(promoService.validar(codigo, subtotal));
    }

    @Operation(summary = "[Marketing] Listar cupones")
    @GetMapping
    public ResponseEntity<List<CuponDTO>> listar() {
        return ResponseEntity.ok(promoService.listar());
    }

    @Operation(summary = "[Marketing] Crear cupón")
    @PostMapping
    public ResponseEntity<CuponDTO> crear(@Valid @RequestBody CuponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promoService.crear(request));
    }

    @Operation(summary = "[Marketing] Actualizar cupón")
    @PutMapping("/admin/{id}")
    public ResponseEntity<CuponDTO> actualizar(@PathVariable @Positive Long id, @Valid @RequestBody CuponRequest request) {
        return ResponseEntity.ok(promoService.actualizar(id, request));
    }

    @Operation(summary = "[Marketing] Desactivar cupón", description = "No se borra: queda en el historial de los pedidos que lo usaron.")
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable @Positive Long id) {
        promoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}

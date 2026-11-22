package df.portal.cl.controller.Ubicacion;

import df.portal.cl.remote.ordenes.OrdenesDtos.ComunaRemota;
import df.portal.cl.remote.ordenes.OrdenesDtos.RegionRemota;
import df.portal.cl.services.Ubicacion.UbicacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/ubicaciones")
@RequiredArgsConstructor
@Tag(name = "Ubicaciones", description = "Regiones y comunas (catálogo de ms-workorders) para registro y checkout")
public class UbicacionController {

    private final UbicacionService ubicacionService;

    @Operation(summary = "Regiones de Chile")
    @GetMapping("/regiones")
    public ResponseEntity<List<RegionRemota>> regiones() {
        return ResponseEntity.ok(ubicacionService.regiones());
    }

    @Operation(summary = "Comunas de una región")
    @GetMapping("/regiones/{idRegion}/comunas")
    public ResponseEntity<List<ComunaRemota>> comunas(@PathVariable @Positive Long idRegion) {
        return ResponseEntity.ok(ubicacionService.comunas(idRegion));
    }
}

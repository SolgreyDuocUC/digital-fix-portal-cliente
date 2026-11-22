package df.portal.cl.controller.Product;

import df.portal.cl.dto.productos.ProductoPublicoDTO;
import df.portal.cl.dto.productos.ProductoTiendaDTO;
import df.portal.cl.dto.productos.VincularImagenDriveRequest;
import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.services.Product.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// A diferencia del ejemplo One Tech, aquí no se crean ni borran productos: la fuente de verdad es el
// ERP (ms-catalog para repuestos, ms-workorders para servicios). El portal solo agrega la capa
// comercial (imagen, badge, descuento, visibilidad) que gestiona Marketing.
@Validated
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Tienda", description = "Catálogo público (desde ms-catalog y ms-workorders) y capa comercial de Marketing")
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "Repuestos a la venta",
            description = "Repuestos activos de ms-catalog con su stock real (descontadas las reservas) y los datos de tienda.")
    @GetMapping
    public ResponseEntity<List<ProductoPublicoDTO>> repuestos(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoria,
            @RequestParam(defaultValue = "false") boolean soloEnStock) {
        return ResponseEntity.ok(productService.listarRepuestos(search, categoria, soloEnStock));
    }

    @Operation(summary = "Categorías de repuestos")
    @GetMapping("/categories")
    public ResponseEntity<List<String>> categorias() {
        return ResponseEntity.ok(productService.listarCategorias());
    }

    @Operation(summary = "Servicios técnicos contratables", description = "Servicios activos del catálogo de ms-workorders.")
    @GetMapping("/services")
    public ResponseEntity<List<ProductoPublicoDTO>> servicios(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.listarServicios(search));
    }

    @Operation(summary = "Detalle de un repuesto")
    @GetMapping("/{id}")
    public ResponseEntity<ProductoPublicoDTO> repuesto(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(productService.obtenerRepuesto(id));
    }

    // ---- Marketing ----

    @Operation(summary = "[Marketing] Ítems del ERP con su capa comercial", description = "Incluye los ocultos en la tienda.")
    @GetMapping("/tienda")
    public ResponseEntity<List<ProductoTiendaDTO>> paraMarketing() {
        return ResponseEntity.ok(productService.listarParaMarketing());
    }

    @Operation(summary = "[Marketing] Configurar un ítem en la tienda",
            description = "Imagen desde un enlace de Google Drive, nombre y descripción comercial, categoría, badge, "
                    + "descuento (0-90 %), destacado y visibilidad. No cambia precios ni stock del ERP.")
    @PutMapping("/tienda/{tipo}/{idMicroservicio}")
    public ResponseEntity<ProductoTiendaDTO> configurar(@PathVariable TipoItemTienda tipo,
                                                        @PathVariable @Positive Long idMicroservicio,
                                                        @RequestBody VincularImagenDriveRequest request) {
        return ResponseEntity.ok(productService.actualizarDatosTienda(tipo, idMicroservicio, request));
    }
}

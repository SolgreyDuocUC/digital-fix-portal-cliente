package df.portal.cl.controller.Resenia;

import df.portal.cl.dto.resenias.CrearReseniaDTO;
import df.portal.cl.dto.resenias.RegistrarAccionMejoraDTO;
import df.portal.cl.dto.resenias.ReseniaResponseDTO;
import df.portal.cl.dto.resenias.ResumenCalificacionesDTO;
import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.model.resenias.CategoriaResenia;
import df.portal.cl.model.resenias.EstadoResenia;
import df.portal.cl.security.UsuarioAutenticado;
import df.portal.cl.services.Resenia.ReseniaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/resenias")
@RequiredArgsConstructor
@Tag(name = "Reseñas & Feedback", description = "Gestión de opiniones de clientes, auditoría de satisfacción, críticas y registro de mejoras operativas")
public class ReseniaController {

    private final ReseniaService reseniaService;

    // =========================================================================
    // Endpoints Públicos para el Portal de Clientes
    // =========================================================================

    @Operation(summary = "Listar reseñas públicas de un producto o servicio",
            description = "Devuelve todas las opiniones verificadas y aprobadas para mostrar en la ficha e-commerce.")
    @GetMapping("/item/{tipoItem}/{idMicroservicio}")
    public ResponseEntity<List<ReseniaResponseDTO>> listarPorItem(
            @PathVariable TipoItemTienda tipoItem,
            @PathVariable Long idMicroservicio) {
        return ResponseEntity.ok(reseniaService.listarPublicadasPorItem(tipoItem, idMicroservicio));
    }

    @Operation(summary = "Obtener resumen de estrellas de un producto o servicio",
            description = "Devuelve el promedio de estrellas y el desglose de 1 a 5 estrellas para la ficha técnica.")
    @GetMapping("/item/{tipoItem}/{idMicroservicio}/resumen")
    public ResponseEntity<ResumenCalificacionesDTO> obtenerResumenPorItem(
            @PathVariable TipoItemTienda tipoItem,
            @PathVariable Long idMicroservicio) {
        return ResponseEntity.ok(reseniaService.obtenerResumenCalificacionesPorItem(tipoItem, idMicroservicio));
    }

    @Operation(summary = "Publicar una nueva reseña de cliente",
            description = "Permite a un cliente calificar un servicio o repuesto adquirido. Si está autenticado, se asocia a su cuenta.")
    @PostMapping
    public ResponseEntity<ReseniaResponseDTO> crear(
            @Valid @RequestBody CrearReseniaDTO dto,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        Long idUsuario = usuario != null ? usuario.id() : null;
        ReseniaResponseDTO response = reseniaService.crear(dto, idUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =========================================================================
    // Endpoints Administrativos para Asistente Comercial y Jefe de Ventas y Operaciones
    // =========================================================================

    @Operation(summary = "[Admin] Listado completo de auditoría de reseñas",
            description = "Permite filtrar opiniones por estado (PUBLICADA, OCULTA) o categoría (CRITICA, MEJORA, FELICITACION).")
    @GetMapping("/admin")
    public ResponseEntity<List<ReseniaResponseDTO>> listarParaAuditoria(
            @RequestParam(required = false) EstadoResenia estado,
            @RequestParam(required = false) CategoriaResenia categoria) {
        return ResponseEntity.ok(reseniaService.listarParaAuditoria(estado, categoria));
    }

    @Operation(summary = "[Admin] Métricas globales de satisfacción de clientes (CSAT)",
            description = "Promedio global y distribución de felicitaciones, oportunidades de mejora y críticas.")
    @GetMapping("/admin/metricas-generales")
    public ResponseEntity<ResumenCalificacionesDTO> obtenerMetricasGenerales() {
        return ResponseEntity.ok(reseniaService.obtenerMetricasGenerales());
    }

    @Operation(summary = "[Admin] Registrar plan de acción u oportunidad de mejora",
            description = "Permite al Jefe de Ventas y Operaciones o Asistente Comercial documentar la medida correctiva adoptada.")
    @PatchMapping("/admin/{idResenia}/accion-mejora")
    public ResponseEntity<ReseniaResponseDTO> registrarAccionMejora(
            @PathVariable Long idResenia,
            @Valid @RequestBody RegistrarAccionMejoraDTO dto,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        String usuarioAdmin = usuario != null ? usuario.nombre() : "Jefatura Comercial";
        return ResponseEntity.ok(reseniaService.registrarAccionMejora(idResenia, dto, usuarioAdmin));
    }

    @Operation(summary = "[Admin] Cambiar estado de moderación de una reseña",
            description = "Permite publicar u ocultar una reseña de la tienda online.")
    @PatchMapping("/admin/{idResenia}/estado")
    public ResponseEntity<ReseniaResponseDTO> cambiarEstado(
            @PathVariable Long idResenia,
            @RequestParam EstadoResenia nuevoEstado) {
        return ResponseEntity.ok(reseniaService.cambiarEstado(idResenia, nuevoEstado));
    }

    @Operation(summary = "[Admin] Eliminar una reseña por ID")
    @DeleteMapping("/admin/{idResenia}")
    public ResponseEntity<Void> eliminar(@PathVariable Long idResenia) {
        reseniaService.eliminar(idResenia);
        return ResponseEntity.noContent().build();
    }
}


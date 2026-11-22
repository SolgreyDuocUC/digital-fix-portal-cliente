package df.portal.cl.services.Resenia;

import df.portal.cl.dto.resenias.CrearReseniaDTO;
import df.portal.cl.dto.resenias.RegistrarAccionMejoraDTO;
import df.portal.cl.dto.resenias.ReseniaResponseDTO;
import df.portal.cl.dto.resenias.ResumenCalificacionesDTO;
import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.model.resenias.CategoriaResenia;
import df.portal.cl.model.resenias.EstadoResenia;

import java.util.List;

public interface ReseniaService {

    /**
     * Registra una nueva reseña de cliente en el sistema.
     */
    ReseniaResponseDTO crear(CrearReseniaDTO dto, Long idUsuarioAutenticado);

    /**
     * Lista las reseñas publicadas de un ítem (producto o servicio) para el portal de clientes.
     */
    List<ReseniaResponseDTO> listarPublicadasPorItem(TipoItemTienda tipoItem, Long idMicroservicio);

    /**
     * Obtiene el resumen de estrellas y métricas de satisfacción de un ítem.
     */
    ResumenCalificacionesDTO obtenerResumenCalificacionesPorItem(TipoItemTienda tipoItem, Long idMicroservicio);

    /**
     * Lista todas las reseñas para el panel de auditoría comercial de Marketing y Jefatura.
     */
    List<ReseniaResponseDTO> listarParaAuditoria(EstadoResenia estadoFiltro, CategoriaResenia categoriaFiltro);

    /**
     * Obtiene el resumen global de satisfacción de toda la plataforma (CSAT).
     */
    ResumenCalificacionesDTO obtenerMetricasGenerales();

    /**
     * Registra un plan de acción u oportunidad de mejora operacional sobre una reseña o crítica.
     */
    ReseniaResponseDTO registrarAccionMejora(Long idResenia, RegistrarAccionMejoraDTO dto, String usuarioAdmin);

    /**
     * Modera el estado de una reseña (PUBLICADA, PENDIENTE_MODERACION, OCULTA).
     */
    ReseniaResponseDTO cambiarEstado(Long idResenia, EstadoResenia nuevoEstado);

    /**
     * Elimina una reseña del sistema por ID.
     */
    void eliminar(Long idResenia);
}


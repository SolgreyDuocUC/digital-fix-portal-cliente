package df.portal.cl.dto.resenias;

import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.model.resenias.CategoriaResenia;
import df.portal.cl.model.resenias.EstadoResenia;
import df.portal.cl.model.resenias.Resenia;

import java.time.OffsetDateTime;

public record ReseniaResponseDTO(
        Long idResenia,
        Long idMicroservicio,
        TipoItemTienda tipoItem,
        String codigoItem,
        String nombreItem,
        Long idUsuario,
        String nombreCliente,
        String comuna,
        Integer calificacion,
        String titulo,
        String comentario,
        CategoriaResenia categoria,
        EstadoResenia estado,
        boolean compraVerificada,
        String planAccionMejora,
        String usuarioAccionMejora,
        OffsetDateTime fechaAccionMejora,
        OffsetDateTime fechaCreacion
) {
    public static ReseniaResponseDTO fromEntity(Resenia r) {
        return new ReseniaResponseDTO(
                r.getIdResenia(),
                r.getIdMicroservicio(),
                r.getTipoItem(),
                r.getCodigoItem(),
                r.getNombreItem(),
                r.getIdUsuario(),
                r.getNombreCliente(),
                r.getComuna(),
                r.getCalificacion(),
                r.getTitulo(),
                r.getComentario(),
                r.getCategoria(),
                r.getEstado(),
                r.isCompraVerificada(),
                r.getPlanAccionMejora(),
                r.getUsuarioAccionMejora(),
                r.getFechaAccionMejora(),
                r.getFechaCreacion()
        );
    }
}


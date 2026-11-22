package df.portal.cl.dto.resenias;

import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.model.resenias.CategoriaResenia;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearReseniaDTO(
        @NotNull(message = "El ID de microservicio es obligatorio")
        Long idMicroservicio,

        @NotNull(message = "El tipo de ítem (REPUESTO o SERVICIO) es obligatorio")
        TipoItemTienda tipoItem,

        String codigoItem,

        String nombreItem,

        @NotBlank(message = "El nombre del cliente es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombreCliente,

        String comuna,

        @NotNull(message = "La calificación es obligatoria")
        @Min(value = 1, message = "La calificación mínima es 1 estrella")
        @Max(value = 5, message = "La calificación máxima es 5 estrellas")
        Integer calificacion,

        @Size(max = 120, message = "El título no puede superar los 120 caracteres")
        String titulo,

        @NotBlank(message = "El comentario es obligatorio")
        @Size(max = 1000, message = "El comentario no puede superar los 1000 caracteres")
        String comentario,

        CategoriaResenia categoria
) {
}


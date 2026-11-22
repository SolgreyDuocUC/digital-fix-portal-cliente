package df.portal.cl.dto.resenias;

import java.util.Map;

public record ResumenCalificacionesDTO(
        Double promedioEstrellas,
        long totalResenias,
        long totalFelicitaciones,
        long totalMejoras,
        long totalCriticas,
        Map<Integer, Long> desglosePorEstrellas
) {
}


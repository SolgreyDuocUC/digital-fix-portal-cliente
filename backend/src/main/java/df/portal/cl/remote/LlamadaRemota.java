package df.portal.cl.remote;

import df.portal.cl.dto.ErrorResponse;
import df.portal.cl.exceptions.NegocioException;
import df.portal.cl.exceptions.ServicioExternoException;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.function.Supplier;

/**
 * Traduce los fallos de una llamada a un microservicio a errores del portal:
 * <ul>
 *   <li>sin conexión o timeout → 503 "&lt;servicio&gt; no está disponible";</li>
 *   <li>4xx del microservicio (dato inválido, no existe, conflicto) → mismo estado y su mensaje;</li>
 *   <li>5xx o 401/403 (configuración entre servicios) → 502.</li>
 * </ul>
 */
public final class LlamadaRemota {

    private LlamadaRemota() {
    }

    public static <T> T ejecutar(String servicio, Supplier<T> llamada) {
        try {
            return llamada.get();
        } catch (ResourceAccessException ex) {
            throw ServicioExternoException.noDisponible(servicio);
        } catch (RestClientResponseException ex) {
            int status = ex.getStatusCode().value();
            if (status == 401 || status == 403 || status >= 500) {
                throw ServicioExternoException.falla(servicio, status);
            }
            ErrorResponse cuerpo = leerError(ex);
            String mensaje = cuerpo != null && cuerpo.message() != null
                    ? cuerpo.message()
                    : servicio + " rechazó la solicitud (" + status + ")";
            List<String> detalles = cuerpo != null && cuerpo.errors() != null ? cuerpo.errors() : List.of();
            HttpStatus estado = HttpStatus.resolve(status);
            throw new NegocioException(estado != null ? estado : HttpStatus.BAD_REQUEST, mensaje, detalles);
        }
    }

    private static ErrorResponse leerError(RestClientResponseException ex) {
        try {
            return ex.getResponseBodyAs(ErrorResponse.class);
        } catch (RuntimeException ignorada) {
            return null;
        }
    }
}

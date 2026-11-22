package df.portal.cl.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Un microservicio no respondió (503) o respondió con un error propio (502).
 * El mensaje nombra el servicio para que el problema sea fácil de diagnosticar.
 */
public class ServicioExternoException extends NegocioException {

    public ServicioExternoException(HttpStatus status, String mensaje) {
        super(status, mensaje);
    }

    public static ServicioExternoException noDisponible(String servicio) {
        return new ServicioExternoException(HttpStatus.SERVICE_UNAVAILABLE,
                servicio + " no está disponible en este momento. Intenta nuevamente en unos minutos.");
    }

    public static ServicioExternoException falla(String servicio, int status) {
        return new ServicioExternoException(HttpStatus.BAD_GATEWAY,
                servicio + " respondió con un error (" + status + ").");
    }
}

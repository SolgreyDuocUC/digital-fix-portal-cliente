package df.portal.cl.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * Error de negocio con el estado HTTP que debe recibir el cliente
 * (400 dato inválido, 404 no existe, 409 conflicto como stock insuficiente o RUT duplicado).
 */
@Getter
public class NegocioException extends RuntimeException {

    private final HttpStatus status;
    private final List<String> detalles;

    public NegocioException(HttpStatus status, String mensaje) {
        this(status, mensaje, List.of());
    }

    public NegocioException(HttpStatus status, String mensaje, List<String> detalles) {
        super(mensaje);
        this.status = status;
        this.detalles = detalles == null ? List.of() : List.copyOf(detalles);
    }

    public static NegocioException invalido(String mensaje) {
        return new NegocioException(HttpStatus.BAD_REQUEST, mensaje);
    }

    public static NegocioException noEncontrado(String mensaje) {
        return new NegocioException(HttpStatus.NOT_FOUND, mensaje);
    }

    public static NegocioException conflicto(String mensaje) {
        return new NegocioException(HttpStatus.CONFLICT, mensaje);
    }
}

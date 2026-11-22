package df.portal.cl.exceptions;

import df.portal.cl.dto.ErrorResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NegocioException.class)
    ResponseEntity<ErrorResponse> negocio(NegocioException ex) {
        if (ex instanceof ServicioExternoException) {
            log.warn("Servicio externo: {}", ex.getMessage());
        }
        return respuesta(ex.getStatus(), ex.getMessage(), ex.getDetalles());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> validacion(MethodArgumentNotValidException ex) {
        List<String> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList();
        return respuesta(HttpStatus.BAD_REQUEST, "Hay datos inválidos en la solicitud", errores);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<ErrorResponse> validacionParametros(HandlerMethodValidationException ex) {
        List<String> errores = ex.getAllErrors().stream().map(e -> e.getDefaultMessage()).toList();
        return respuesta(HttpStatus.BAD_REQUEST, "Hay parámetros inválidos en la solicitud", errores);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ErrorResponse> restricciones(ConstraintViolationException ex) {
        List<String> errores = ex.getConstraintViolations().stream().map(v -> v.getMessage()).toList();
        return respuesta(HttpStatus.BAD_REQUEST, "Hay datos inválidos en la solicitud", errores);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<ErrorResponse> formato(Exception ex) {
        return respuesta(HttpStatus.BAD_REQUEST, "El formato de la solicitud no es válido", List.of());
    }

    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<ErrorResponse> credenciales(BadCredentialsException ex) {
        return respuesta(HttpStatus.UNAUTHORIZED, ex.getMessage(), List.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ErrorResponse> accesoDenegado(AccessDeniedException ex) {
        return respuesta(HttpStatus.FORBIDDEN, "No tienes permiso para realizar esta acción", List.of());
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    ResponseEntity<ErrorResponse> concurrencia(OptimisticLockingFailureException ex) {
        return respuesta(HttpStatus.CONFLICT, "El registro fue modificado por otra operación. Intenta nuevamente.", List.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorResponse> integridad(DataIntegrityViolationException ex) {
        log.warn("Violación de integridad: {}", ex.getMostSpecificCause().getMessage());
        return respuesta(HttpStatus.CONFLICT, "El registro entra en conflicto con datos existentes", List.of());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> inesperado(Exception ex) {
        log.error("Error inesperado", ex);
        return respuesta(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado en el portal", List.of());
    }

    private static ResponseEntity<ErrorResponse> respuesta(HttpStatus status, String mensaje, List<String> errores) {
        return ResponseEntity.status(status).body(ErrorResponse.de(status.value(), mensaje, errores));
    }
}

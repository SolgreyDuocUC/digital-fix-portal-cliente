package df.portal.cl.dto;

import java.time.LocalDateTime;
import java.util.List;

/** Mismo cuerpo de error que ms-catalog y ms-workorders. */
public record ErrorResponse(int status, String message, LocalDateTime timestamp, List<String> errors) {

    public static ErrorResponse de(int status, String message, List<String> errors) {
        return new ErrorResponse(status, message, LocalDateTime.now(), errors == null ? List.of() : errors);
    }
}

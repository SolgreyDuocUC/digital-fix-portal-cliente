package df.portal.cl.controller.Auth;

import df.portal.cl.dto.Auth.AuthResponse;
import df.portal.cl.dto.Auth.LoginRequest;
import df.portal.cl.dto.Auth.RefreshRequest;
import df.portal.cl.dto.Auth.RegisterRequest;
import df.portal.cl.services.User.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro de clientes y sesión con JWT propio del portal (sin Entra ID)")
public class AuthController {

    private final UserService userService;

    @Operation(summary = "Registrar un cliente",
            description = "Crea la cuenta (rol CLIENTE) y devuelve la sesión iniciada. El RUT se valida con dígito verificador "
                    + "y es la llave con que el ERP reconoce al cliente en su primer pedido.")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registrar(request));
    }

    @Operation(summary = "Iniciar sesión", description = "Devuelve accessToken (corto) y refreshToken. 401 si las credenciales no coinciden.")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @Operation(summary = "Refrescar el access token", description = "Recibe el refreshToken y entrega un accessToken nuevo.")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(userService.refrescar(request.refreshToken()));
    }
}

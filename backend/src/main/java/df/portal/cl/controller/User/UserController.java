package df.portal.cl.controller.User;

import df.portal.cl.dto.User.ActualizarPerfilDTO;
import df.portal.cl.dto.User.CambiarPasswordDTO;
import df.portal.cl.dto.User.EliminarCuentaDTO;
import df.portal.cl.dto.User.UsuarioDTO;
import df.portal.cl.security.UsuarioAutenticado;
import df.portal.cl.services.User.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// Solo "mi cuenta": a diferencia del ejemplo One Tech, ninguna ruta recibe el id del usuario,
// así nadie puede leer ni modificar la cuenta de otro.
@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Tag(name = "Mi cuenta", description = "Perfil del usuario autenticado")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Ver mi perfil")
    @GetMapping
    public ResponseEntity<UsuarioDTO> perfil(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.ok(userService.perfil(usuario.id()));
    }

    @Operation(summary = "Actualizar mi perfil", description = "Solo cambia los campos enviados. El RUT y el correo no se modifican.")
    @PutMapping
    public ResponseEntity<UsuarioDTO> actualizar(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                 @Valid @RequestBody ActualizarPerfilDTO dto) {
        return ResponseEntity.ok(userService.actualizarPerfil(usuario.id(), dto));
    }

    @Operation(summary = "Cambiar mi contraseña")
    @PutMapping("/password")
    public ResponseEntity<Void> cambiarPassword(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                @Valid @RequestBody CambiarPasswordDTO dto) {
        userService.cambiarPassword(usuario.id(), dto);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar mi cuenta", description = "Si tiene pedidos se desactiva en vez de borrarse.")
    @DeleteMapping
    public ResponseEntity<Void> eliminar(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                         @Valid @RequestBody EliminarCuentaDTO dto) {
        userService.eliminarCuenta(usuario.id(), dto.password());
        return ResponseEntity.noContent().build();
    }
}

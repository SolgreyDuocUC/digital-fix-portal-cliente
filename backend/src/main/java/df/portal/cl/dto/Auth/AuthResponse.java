package df.portal.cl.dto.Auth;

import df.portal.cl.dto.User.UsuarioDTO;

import java.util.List;

/** Igual que el AuthResponse de One Tech (id, email, roles, tokens) más los datos del perfil. */
public record AuthResponse(
        Long id,
        String email,
        List<String> roles,
        String accessToken,
        String refreshToken,
        long expiraEnSegundos,
        UsuarioDTO usuario
) {
}

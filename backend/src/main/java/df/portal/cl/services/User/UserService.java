package df.portal.cl.services.User;

import df.portal.cl.dto.Auth.AuthResponse;
import df.portal.cl.dto.Auth.LoginRequest;
import df.portal.cl.dto.Auth.RegisterRequest;
import df.portal.cl.dto.User.ActualizarPerfilDTO;
import df.portal.cl.dto.User.CambiarPasswordDTO;
import df.portal.cl.dto.User.UsuarioDTO;
import df.portal.cl.model.usuarios.Usuario;

/** Identidad local del portal: registro, sesión (JWT propio) y perfil. */
public interface UserService {

    /** Registra un cliente y deja la sesión iniciada. */
    AuthResponse registrar(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refrescar(String refreshToken);

    UsuarioDTO perfil(Long idUsuario);

    UsuarioDTO actualizarPerfil(Long idUsuario, ActualizarPerfilDTO dto);

    void cambiarPassword(Long idUsuario, CambiarPasswordDTO dto);

    void eliminarCuenta(Long idUsuario, String password);

    Usuario obtenerEntidad(Long idUsuario);
}

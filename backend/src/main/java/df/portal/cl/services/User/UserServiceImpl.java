package df.portal.cl.services.User;

import df.portal.cl.dto.Auth.AuthResponse;
import df.portal.cl.dto.Auth.LoginRequest;
import df.portal.cl.dto.Auth.RegisterRequest;
import df.portal.cl.dto.User.ActualizarPerfilDTO;
import df.portal.cl.dto.User.CambiarPasswordDTO;
import df.portal.cl.dto.User.UsuarioDTO;
import df.portal.cl.exceptions.NegocioException;
import df.portal.cl.model.usuarios.RolUsuario;
import df.portal.cl.model.usuarios.Usuario;
import df.portal.cl.repository.PedidoRepository;
import df.portal.cl.repository.UsuarioRepository;
import df.portal.cl.security.JwtUtil;
import df.portal.cl.util.RutUtil;
import df.portal.cl.util.TelefonoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private static final String CREDENCIALES_INVALIDAS = "Correo o contraseña incorrectos";

    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse registrar(RegisterRequest request) {
        String email = request.email().strip().toLowerCase(Locale.ROOT);
        String rut = normalizarRut(request.rut());
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw NegocioException.conflicto("Ya existe una cuenta con el correo " + email);
        }
        if (usuarioRepository.existsByRut(rut)) {
            throw NegocioException.conflicto("Ya existe una cuenta con el RUT " + rut);
        }

        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .rut(rut)
                .nombre(request.nombre().strip())
                .apellidos(textoOpcional(request.apellidos()))
                .razonSocial(textoOpcional(request.razonSocial()))
                .email(email)
                .telefono(normalizarTelefono(request.telefono()))
                .password(passwordEncoder.encode(request.password()))
                .direccion(textoOpcional(request.direccion()))
                .idComuna(request.idComuna())
                .comuna(textoOpcional(request.comuna()))
                .region(textoOpcional(request.region()))
                .rol(RolUsuario.ROLE_CLIENTE)
                .activo(true)
                .build());
        return sesion(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email().strip()).orElse(null);
        // Mismo mensaje si el correo no existe o la contraseña no coincide: no se revela qué cuentas existen.
        if (usuario == null || !usuario.isActivo() || !passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw new BadCredentialsException(CREDENCIALES_INVALIDAS);
        }
        return sesion(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refrescar(String refreshToken) {
        String email = jwtUtil.validarRefreshToken(refreshToken)
                .orElseThrow(() -> new BadCredentialsException("La sesión expiró. Inicia sesión nuevamente."));
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new BadCredentialsException("La sesión expiró. Inicia sesión nuevamente."));
        return new AuthResponse(usuario.getIdUsuario(), usuario.getEmail(), List.of(usuario.getRol().sinPrefijo()),
                jwtUtil.generarToken(usuario), refreshToken, jwtUtil.segundosDeVidaAccess(), UsuarioDTO.from(usuario));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO perfil(Long idUsuario) {
        return UsuarioDTO.from(obtenerEntidad(idUsuario));
    }

    @Override
    public UsuarioDTO actualizarPerfil(Long idUsuario, ActualizarPerfilDTO dto) {
        Usuario usuario = obtenerEntidad(idUsuario);
        if (dto.nombre() != null && !dto.nombre().isBlank()) usuario.setNombre(dto.nombre().strip());
        if (dto.apellidos() != null) usuario.setApellidos(textoOpcional(dto.apellidos()));
        if (dto.razonSocial() != null) usuario.setRazonSocial(textoOpcional(dto.razonSocial()));
        if (dto.telefono() != null) usuario.setTelefono(normalizarTelefono(dto.telefono()));
        if (dto.direccion() != null) usuario.setDireccion(textoOpcional(dto.direccion()));
        if (dto.idComuna() != null) usuario.setIdComuna(dto.idComuna());
        if (dto.comuna() != null) usuario.setComuna(textoOpcional(dto.comuna()));
        if (dto.region() != null) usuario.setRegion(textoOpcional(dto.region()));
        return UsuarioDTO.from(usuario);
    }

    @Override
    public void cambiarPassword(Long idUsuario, CambiarPasswordDTO dto) {
        Usuario usuario = obtenerEntidad(idUsuario);
        if (!passwordEncoder.matches(dto.passwordActual(), usuario.getPassword())) {
            throw NegocioException.invalido("La contraseña actual no es correcta");
        }
        if (!dto.passwordNueva().equals(dto.confirmacion())) {
            throw NegocioException.invalido("La confirmación no coincide con la contraseña nueva");
        }
        usuario.setPassword(passwordEncoder.encode(dto.passwordNueva()));
    }

    // Con pedidos no se borra (se perdería el detalle comercial asociado a OT del ERP): se desactiva.
    @Override
    public void eliminarCuenta(Long idUsuario, String password) {
        Usuario usuario = obtenerEntidad(idUsuario);
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw NegocioException.invalido("La contraseña no es correcta");
        }
        if (pedidoRepository.findByUsuario_IdUsuarioOrderByFechaCreacionDesc(idUsuario).isEmpty()) {
            usuarioRepository.delete(usuario);
        } else {
            usuario.setActivo(false);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Usuario obtenerEntidad(Long idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .filter(Usuario::isActivo)
                .orElseThrow(() -> NegocioException.noEncontrado("No existe el usuario " + idUsuario));
    }

    private AuthResponse sesion(Usuario usuario) {
        return new AuthResponse(usuario.getIdUsuario(), usuario.getEmail(), List.of(usuario.getRol().sinPrefijo()),
                jwtUtil.generarToken(usuario), jwtUtil.generarRefreshToken(usuario), jwtUtil.segundosDeVidaAccess(),
                UsuarioDTO.from(usuario));
    }

    private static String normalizarRut(String rut) {
        try {
            return RutUtil.normalizar(rut);
        } catch (IllegalArgumentException ex) {
            throw NegocioException.invalido(ex.getMessage());
        }
    }

    private static String normalizarTelefono(String telefono) {
        try {
            return TelefonoUtil.normalizar(telefono);
        } catch (IllegalArgumentException ex) {
            throw NegocioException.invalido(ex.getMessage());
        }
    }

    private static String textoOpcional(String valor) {
        return valor == null || valor.isBlank() ? null : valor.strip();
    }
}

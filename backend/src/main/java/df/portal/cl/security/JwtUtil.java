package df.portal.cl.security;

import df.portal.cl.config.PortalProperties;
import df.portal.cl.model.usuarios.RolUsuario;
import df.portal.cl.model.usuarios.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

/**
 * Emite y valida los JWT locales del portal (HS256), independientes de Entra ID.
 * <ul>
 *   <li>Access token: lleva id, email, nombre y rol; vida corta. Es el único que autoriza la API.</li>
 *   <li>Refresh token: solo sirve para pedir un access token nuevo en /api/v1/auth/refresh.</li>
 * </ul>
 * El secreto sale de PORTAL_JWT_SECRET (nunca escrito en el código, a diferencia de TokenJwtConfig
 * del ejemplo One Tech).
 */
@Slf4j
@Component
public class JwtUtil {

    static final String CLAIM_TIPO = "tipo";
    static final String TIPO_ACCESS = "access";
    static final String TIPO_REFRESH = "refresh";

    private final SecretKey clave;
    private final String emisor;
    private final Duration vidaAccess;
    private final Duration vidaRefresh;

    public JwtUtil(PortalProperties props) {
        PortalProperties.Jwt jwt = props.jwt();
        this.clave = Keys.hmacShaKeyFor(secreto(jwt.secreto()));
        this.emisor = jwt.emisor();
        this.vidaAccess = Duration.ofMinutes(jwt.expiracionMinutos());
        this.vidaRefresh = Duration.ofDays(jwt.expiracionRefreshDias());
    }

    public String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .issuer(emisor)
                .subject(usuario.getEmail())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(vidaAccess)))
                .claim(CLAIM_TIPO, TIPO_ACCESS)
                .claim("id", usuario.getIdUsuario())
                .claim("nombre", usuario.getNombreCompleto())
                .claim("rol", usuario.getRol().name())
                .signWith(clave, Jwts.SIG.HS256)
                .compact();
    }

    public String generarRefreshToken(Usuario usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .issuer(emisor)
                .subject(usuario.getEmail())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(vidaRefresh)))
                .claim(CLAIM_TIPO, TIPO_REFRESH)
                .claim("id", usuario.getIdUsuario())
                .signWith(clave, Jwts.SIG.HS256)
                .compact();
    }

    public long segundosDeVidaAccess() {
        return vidaAccess.toSeconds();
    }

    /** Access token válido (firma, emisor, vigencia y tipo) → usuario autenticado. */
    public Optional<UsuarioAutenticado> validarAccessToken(String token) {
        return leer(token, TIPO_ACCESS).map(c -> new UsuarioAutenticado(
                ((Number) c.get("id")).longValue(),
                c.getSubject(),
                c.get("nombre", String.class),
                RolUsuario.valueOf(c.get("rol", String.class))));
    }

    /** Refresh token válido → email del usuario. */
    public Optional<String> validarRefreshToken(String token) {
        return leer(token, TIPO_REFRESH).map(Claims::getSubject);
    }

    private Optional<Claims> leer(String token, String tipoEsperado) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(clave)
                    .requireIssuer(emisor)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return tipoEsperado.equals(claims.get(CLAIM_TIPO, String.class)) ? Optional.of(claims) : Optional.empty();
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT rechazado: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private static byte[] secreto(String configurado) {
        if (configurado == null || configurado.isBlank()) {
            byte[] aleatorio = new byte[48];
            new SecureRandom().nextBytes(aleatorio);
            log.warn("PORTAL_JWT_SECRET no está configurado: se usa un secreto aleatorio y las sesiones "
                    + "se pierden al reiniciar. Configúralo fuera de desarrollo.");
            return Base64.getEncoder().encode(aleatorio);
        }
        byte[] bytes = configurado.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("PORTAL_JWT_SECRET debe tener al menos 32 caracteres (HS256)");
        }
        return bytes;
    }
}

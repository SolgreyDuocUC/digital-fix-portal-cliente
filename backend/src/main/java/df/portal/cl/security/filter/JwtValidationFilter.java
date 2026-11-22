package df.portal.cl.security.filter;

import df.portal.cl.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Lee "Authorization: Bearer &lt;token&gt;" y, si el access token es válido, deja al usuario autenticado
 * con su rol como authority (ROLE_CLIENTE, ROLE_VENDEDOR, ROLE_MARKETING o ROLE_JEFE_VENTAS).
 *
 * Un token ausente o inválido no corta la petición aquí: sigue como anónima y SpringSecurityConfig
 * decide (los endpoints públicos responden; los protegidos devuelven 401 en JSON).
 */
public class JwtValidationFilter extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";

    private final JwtUtil jwtUtil;

    public JwtValidationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(PREFIJO)) {
            jwtUtil.validarAccessToken(header.substring(PREFIJO.length()).strip()).ifPresent(usuario -> {
                var autenticacion = new UsernamePasswordAuthenticationToken(
                        usuario, null, AuthorityUtils.createAuthorityList(usuario.rol().name()));
                SecurityContextHolder.getContext().setAuthentication(autenticacion);
            });
        }
        chain.doFilter(request, response);
    }
}

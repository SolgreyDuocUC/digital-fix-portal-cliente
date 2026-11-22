package df.portal.cl.security;

import df.portal.cl.security.filter.JwtValidationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Seguridad del portal ("pensada en producción" del ejemplo One Tech, ya activa).
 *
 * Público: login/registro/refresh, catálogo, ubicaciones y Swagger.
 * CLIENTE: reservar stock, crear y seguir sus pedidos, validar cupones, su perfil.
 * MARKETING: datos comerciales de la tienda (imagen Drive, badge, descuento, visibilidad) y cupones.
 * JEFE_VENTAS: auditoría de reseñas; la aprobación de campañas y cotizaciones llega con la fase 3.
 * VENDEDOR: por ahora consulta el catálogo con sesión; las cotizaciones son la fase 3 de Tareas.md.
 */
@Configuration
@EnableWebSecurity
public class SpringSecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtUtil jwtUtil,
                                            CorsConfigurationSource corsConfigurationSource) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth

                        /** SWAGGER Y PREFLIGHT CORS */
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        /** AUTH PÚBLICO */
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/register",
                                "/api/v1/auth/refresh").permitAll()

                        /** CATÁLOGO Y UBICACIONES – públicos (la tienda se navega sin sesión) */
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/tienda", "/api/v1/products/tienda/**")
                                .hasRole("MARKETING")
                        .requestMatchers(HttpMethod.GET, "/api/v1/products", "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/ubicaciones/**").permitAll()

                        /** MARKETING – capa comercial de la tienda y cupones */
                        .requestMatchers("/api/v1/products/tienda/**").hasRole("MARKETING")
                        .requestMatchers(HttpMethod.GET, "/api/v1/promo-codes/*").authenticated()
                        .requestMatchers("/api/v1/promo-codes", "/api/v1/promo-codes/**").hasRole("MARKETING")

                        /** CLIENTE – reserva de stock y pedidos (se convierten en OT en ms-workorders) */
                        .requestMatchers("/api/v1/stock/**").hasRole("CLIENTE")
                        .requestMatchers("/api/v1/orders", "/api/v1/orders/**").hasRole("CLIENTE")

                        /** RESEÑAS Y FEEDBACK – público para consulta y creación de clientes, admin para gestión */
                        .requestMatchers(HttpMethod.GET, "/api/v1/resenias/item/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/resenias").permitAll()
                        .requestMatchers("/api/v1/resenias/admin/**").hasAnyRole("MARKETING", "VENDEDOR", "JEFE_VENTAS")

                        /** PERFIL PROPIO */
                        .requestMatchers("/api/v1/users/me", "/api/v1/users/me/**").authenticated()

                        /** RESTO */
                        .anyRequest().denyAll()
                )

                .addFilterBefore(new JwtValidationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) ->
                                escribirError(res, HttpServletResponse.SC_UNAUTHORIZED, "Debes iniciar sesión (token ausente, inválido o expirado)"))
                        .accessDeniedHandler((req, res, e) ->
                                escribirError(res, HttpServletResponse.SC_FORBIDDEN, "Tu rol no tiene permiso para esta acción")))
                .build();
    }

    // Mismo cuerpo que ErrorResponse; se escribe a mano porque ocurre antes de llegar a Spring MVC.
    private static void escribirError(HttpServletResponse res, int status, String mensaje) throws IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"status\":" + status + ",\"message\":\"" + mensaje + "\",\"timestamp\":\""
                + LocalDateTime.now() + "\",\"errors\":[]}");
    }
}

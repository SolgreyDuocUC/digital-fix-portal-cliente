package df.portal.cl.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Configuración del portal (prefijo "portal" en application.yaml). */
@ConfigurationProperties(prefix = "portal")
public record PortalProperties(
        List<String> corsAllowedOrigins,
        Jwt jwt,
        boolean datosDemo,
        Stock stock,
        ServiciosExternos serviciosExternos
) {

    public record Jwt(String secreto, long expiracionMinutos, long expiracionRefreshDias, String emisor) {
    }

    public record Stock(int minutosReserva) {
    }

    public record ServiciosExternos(Servicio msCatalog, ServicioConClave msWorkorders,
                                    int timeoutConexionMs, int timeoutLecturaMs) {
    }

    public record Servicio(String url) {
    }

    public record ServicioConClave(String url, String apiKey) {
    }
}

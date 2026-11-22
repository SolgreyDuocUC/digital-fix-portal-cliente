package df.portal.cl.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Clientes HTTP hacia el ecosistema de microservicios.
 * <ul>
 *   <li>ms-catalog: endpoints B2C públicos (catálogo y reserva de stock), sin credenciales.</li>
 *   <li>ms-workorders: API externa /api/externo/** con la clave de servicio X-Portal-Api-Key.</li>
 * </ul>
 * Timeouts cortos: si un microservicio no responde, el portal informa el problema en vez de colgarse.
 */
@Slf4j
@Configuration
public class RestClientConfig {

    public static final String HEADER_API_KEY = "X-Portal-Api-Key";

    @Bean
    @Qualifier("msCatalog")
    RestClient msCatalogRestClient(RestClient.Builder builder, PortalProperties props) {
        var externos = props.serviciosExternos();
        return builder.clone()
                .baseUrl(externos.msCatalog().url())
                .requestFactory(fabrica(externos))
                .build();
    }

    @Bean
    @Qualifier("msWorkorders")
    RestClient msWorkordersRestClient(RestClient.Builder builder, PortalProperties props) {
        var externos = props.serviciosExternos();
        String apiKey = externos.msWorkorders().apiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("MS_WORKORDERS_API_KEY no está configurada: ms-workorders rechazará los pedidos y el seguimiento del portal");
        }
        return builder.clone()
                .baseUrl(externos.msWorkorders().url())
                .defaultHeader(HEADER_API_KEY, apiKey == null ? "" : apiKey)
                .requestFactory(fabrica(externos))
                .build();
    }

    private static SimpleClientHttpRequestFactory fabrica(PortalProperties.ServiciosExternos externos) {
        var fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(Duration.ofMillis(externos.timeoutConexionMs()));
        fabrica.setReadTimeout(Duration.ofMillis(externos.timeoutLecturaMs()));
        return fabrica;
    }
}

package df.portal.cl.remote.catalogo;

import df.portal.cl.remote.catalogo.CatalogoDtos.ProductoCatalogo;
import df.portal.cl.remote.catalogo.CatalogoDtos.VerifyAndHoldRequest;
import df.portal.cl.remote.catalogo.CatalogoDtos.VerifyAndHoldResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

import static df.portal.cl.remote.LlamadaRemota.ejecutar;

/**
 * Cliente de ms-catalog (fuente de verdad de repuestos, precios y stock).
 * Usa solo los endpoints B2C públicos del issue "Endpoints B2C para consulta de catálogo y reserva de stock".
 */
@Slf4j
@Component
public class CatalogoClient {

    static final String SERVICIO = "El catálogo (ms-catalog)";

    private final RestClient restClient;

    public CatalogoClient(@Qualifier("msCatalog") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<ProductoCatalogo> listarProductos() {
        return ejecutar(SERVICIO, () -> restClient.get()
                .uri("/api/catalog/products")
                .retrieve()
                .body(new ParameterizedTypeReference<List<ProductoCatalogo>>() {}));
    }

    public ProductoCatalogo obtenerProducto(Long id) {
        return ejecutar(SERVICIO, () -> restClient.get()
                .uri("/api/catalog/products/{id}", id)
                .retrieve()
                .body(ProductoCatalogo.class));
    }

    public List<String> listarCategorias() {
        return ejecutar(SERVICIO, () -> restClient.get()
                .uri("/api/catalog/products/categories")
                .retrieve()
                .body(new ParameterizedTypeReference<List<String>>() {}));
    }

    /** Verifica y retiene stock. Responde 200 aunque falte stock: revisar {@code exitoso()}. */
    public VerifyAndHoldResponse verificarYReservar(VerifyAndHoldRequest request) {
        return ejecutar(SERVICIO, () -> restClient.post()
                .uri("/api/catalog/stock/verify-and-hold")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(VerifyAndHoldResponse.class));
    }

    public void liberarReserva(String tokenReserva) {
        ejecutar(SERVICIO, () -> restClient.post()
                .uri(uri -> uri.path("/api/catalog/stock/release-hold").queryParam("tokenReserva", tokenReserva).build())
                .retrieve()
                .toBodilessEntity());
    }

    /** Liberación de mejor esfuerzo (compensación): si falla, la reserva igual expira sola. */
    public void liberarReservaSilenciosamente(String tokenReserva) {
        if (tokenReserva == null) {
            return;
        }
        try {
            liberarReserva(tokenReserva);
        } catch (RuntimeException ex) {
            log.warn("No se pudo liberar la reserva {} (expirará sola): {}", tokenReserva, ex.getMessage());
        }
    }
}

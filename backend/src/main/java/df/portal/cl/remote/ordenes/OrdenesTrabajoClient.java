package df.portal.cl.remote.ordenes;

import df.portal.cl.remote.ordenes.OrdenesDtos.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

import static df.portal.cl.remote.LlamadaRemota.ejecutar;

/**
 * Cliente de la API externa de ms-workorders (header X-Portal-Api-Key, ver RestClientConfig).
 * Las órdenes que se crean aquí son OT normales del ERP: las ve y opera el portal de empleados.
 */
@Component
public class OrdenesTrabajoClient {

    static final String SERVICIO = "La central de órdenes (ms-workorders)";

    private final RestClient restClient;

    public OrdenesTrabajoClient(@Qualifier("msWorkorders") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<ServicioRemoto> listarServicios() {
        return ejecutar(SERVICIO, () -> restClient.get()
                .uri("/api/externo/servicios")
                .retrieve()
                .body(new ParameterizedTypeReference<List<ServicioRemoto>>() {}));
    }

    public List<RegionRemota> listarRegiones() {
        return ejecutar(SERVICIO, () -> restClient.get()
                .uri("/api/externo/regiones")
                .retrieve()
                .body(new ParameterizedTypeReference<List<RegionRemota>>() {}));
    }

    public List<ComunaRemota> listarComunas(Long idRegion) {
        return ejecutar(SERVICIO, () -> restClient.get()
                .uri("/api/externo/regiones/{id}/comunas", idRegion)
                .retrieve()
                .body(new ParameterizedTypeReference<List<ComunaRemota>>() {}));
    }

    public SeguimientoOrden crearOrden(OrdenPortalRequest request) {
        return ejecutar(SERVICIO, () -> restClient.post()
                .uri("/api/externo/ordenes-trabajo")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(SeguimientoOrden.class));
    }

    public List<SeguimientoOrden> ordenesDelCliente(String rut) {
        return ejecutar(SERVICIO, () -> restClient.get()
                .uri(uri -> uri.path("/api/externo/ordenes-trabajo").queryParam("rut", rut).build())
                .retrieve()
                .body(new ParameterizedTypeReference<List<SeguimientoOrden>>() {}));
    }

    public SeguimientoOrden seguimiento(Long idOrdenTrabajo, String rut) {
        return ejecutar(SERVICIO, () -> restClient.get()
                .uri(uri -> uri.path("/api/externo/ordenes-trabajo/{id}/seguimiento").queryParam("rut", rut).build(idOrdenTrabajo))
                .retrieve()
                .body(SeguimientoOrden.class));
    }
}

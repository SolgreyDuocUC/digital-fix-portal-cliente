package df.portal.cl.services.Ubicacion;

import df.portal.cl.remote.ordenes.OrdenesDtos.ComunaRemota;
import df.portal.cl.remote.ordenes.OrdenesDtos.RegionRemota;
import df.portal.cl.remote.ordenes.OrdenesTrabajoClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Las regiones y comunas casi no cambian: se guardan en memoria después de la primera consulta. */
@Service
@RequiredArgsConstructor
public class UbicacionServiceImpl implements UbicacionService {

    private final OrdenesTrabajoClient ordenesTrabajoClient;

    private volatile List<RegionRemota> regiones;
    private final Map<Long, List<ComunaRemota>> comunasPorRegion = new ConcurrentHashMap<>();

    @Override
    public List<RegionRemota> regiones() {
        List<RegionRemota> cache = regiones;
        if (cache == null) {
            cache = List.copyOf(ordenesTrabajoClient.listarRegiones());
            regiones = cache;
        }
        return cache;
    }

    @Override
    public List<ComunaRemota> comunas(Long idRegion) {
        List<ComunaRemota> cache = comunasPorRegion.get(idRegion);
        if (cache == null) {
            cache = List.copyOf(ordenesTrabajoClient.listarComunas(idRegion));
            comunasPorRegion.put(idRegion, cache);
        }
        return cache;
    }
}

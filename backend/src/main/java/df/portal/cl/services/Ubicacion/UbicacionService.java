package df.portal.cl.services.Ubicacion;

import df.portal.cl.remote.ordenes.OrdenesDtos.ComunaRemota;
import df.portal.cl.remote.ordenes.OrdenesDtos.RegionRemota;

import java.util.List;

/**
 * Regiones y comunas de Chile. La fuente es ms-workorders (el mismo catálogo con que el ERP valida
 * las direcciones), así el idComuna que elige el cliente siempre es aceptado al crear su OT.
 */
public interface UbicacionService {

    List<RegionRemota> regiones();

    List<ComunaRemota> comunas(Long idRegion);
}

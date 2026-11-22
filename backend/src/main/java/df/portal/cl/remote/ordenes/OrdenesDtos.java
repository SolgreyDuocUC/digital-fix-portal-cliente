package df.portal.cl.remote.ordenes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Contratos de la API externa de ms-workorders (/api/externo/**, paquete dto.Portal del microservicio). */
public final class OrdenesDtos {

    private OrdenesDtos() {
    }

    public record ServicioRemoto(Long idServicio, String codigo, String nombre, String descripcion, BigDecimal tarifa) {
    }

    public record RegionRemota(Long idRegion, String nombre, String numeroRomano) {
    }

    public record ComunaRemota(Long idComuna, String nombre) {
    }

    /** Dirección con el formato de ms-workorders (la región se deduce de la comuna). */
    public record DireccionRemota(Long idComuna, String calle, String numero, String detalle,
                                  String referencia, String codigoPostal) {
    }

    public record OrdenPortalRequest(
            String codigoPedido,
            ClientePortal cliente,
            DireccionRemota direccion,
            List<Long> servicios,
            List<RepuestoSolicitado> repuestos,
            String horarioPreferido,
            String notas,
            String tokenReservaStock
    ) {
        public record ClientePortal(String rut, String nombre, String telefono, String email) {
        }

        public record RepuestoSolicitado(Long idRepuesto, String codigo, String nombre, Integer cantidad) {
        }
    }

    public record SeguimientoOrden(
            Long idOrdenTrabajo,
            String codigoSeguimiento,
            String estado,
            String estadoEtiqueta,
            LocalDateTime fechaIngreso,
            LocalDateTime fechaActualizacionEstado,
            LocalDateTime fechaCierre,
            String cuadrilla,
            List<Hito> hitos,
            List<ServicioContratado> servicios,
            BigDecimal totalManoObra
    ) {
        public record Hito(String estado, String etiqueta, String descripcion, boolean completado, boolean actual) {
        }

        public record ServicioContratado(Long idServicio, String nombre, BigDecimal precio) {
        }
    }
}

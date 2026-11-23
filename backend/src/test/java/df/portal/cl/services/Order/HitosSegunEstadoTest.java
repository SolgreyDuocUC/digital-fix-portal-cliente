package df.portal.cl.services.Order;

import df.portal.cl.dto.Order.PedidoResponseDTO.HitoDTO;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Avance de respaldo que se muestra cuando ms-workorders no responde. */
class HitosSegunEstadoTest {

    @Test
    void enCaminoMarcaLosPasosPreviosComoHechos() {
        List<HitoDTO> hitos = OrderServiceImpl.hitosSegunEstado("EN_DESPLAZAMIENTO");

        assertThat(hitos).extracting(HitoDTO::estado)
                .containsExactly("CREADA", "ASIGNADA", "EN_DESPLAZAMIENTO", "EN_EJECUCION", "CERRADA");
        assertThat(hitos).extracting(HitoDTO::completado).containsExactly(true, true, false, false, false);
        assertThat(hitos).extracting(HitoDTO::actual).containsExactly(false, false, true, false, false);
    }

    @Test
    void cerradaCompletaTodosLosPasos() {
        assertThat(OrderServiceImpl.hitosSegunEstado("CERRADA")).allMatch(HitoDTO::completado);
    }

    @Test
    void canceladaMuestraSoloCreadaYCancelada() {
        assertThat(OrderServiceImpl.hitosSegunEstado("CANCELADA")).extracting(HitoDTO::estado)
                .containsExactly("CREADA", "CANCELADA");
    }

    @Test
    void sinEstadoNoHayHitos() {
        assertThat(OrderServiceImpl.hitosSegunEstado(null)).isEmpty();
    }
}

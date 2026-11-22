package df.portal.cl.model.resenias;

import df.portal.cl.model.productos.TipoItemTienda;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ReseniaTest {

    @Test
    @DisplayName("Debe inferir CategoriaResenia automáticamente según las estrellas")
    void debeInferirCategoriaSegunEstrellas() {
        assertThat(CategoriaResenia.inferirPorEstrellas(5)).isEqualTo(CategoriaResenia.FELICITACION);
        assertThat(CategoriaResenia.inferirPorEstrellas(4)).isEqualTo(CategoriaResenia.FELICITACION);
        assertThat(CategoriaResenia.inferirPorEstrellas(3)).isEqualTo(CategoriaResenia.MEJORA);
        assertThat(CategoriaResenia.inferirPorEstrellas(2)).isEqualTo(CategoriaResenia.CRITICA);
        assertThat(CategoriaResenia.inferirPorEstrellas(1)).isEqualTo(CategoriaResenia.CRITICA);
    }

    @Test
    @DisplayName("Debe registrar oportunidad de mejora operacional y fecha")
    void debeRegistrarMejoraOperacional() {
        Resenia resenia = Resenia.builder()
                .idMicroservicio(2L)
                .tipoItem(TipoItemTienda.SERVICIO)
                .nombreItem("Mantención Tablero TDA")
                .nombreCliente("Condominio San Carlos")
                .calificacion(2)
                .comentario("Demoraron mucho en llegar")
                .categoria(CategoriaResenia.CRITICA)
                .estado(EstadoResenia.PUBLICADA)
                .build();

        assertThat(resenia.getPlanAccionMejora()).isNull();

        resenia.registrarMejoraOperacional(
                "Asignar cuadrilla de zona poniente para Maipú con seguimiento GPS",
                "Carlos Henríquez - Jefe de Ventas y Operaciones"
        );

        assertThat(resenia.getPlanAccionMejora())
                .isEqualTo("Asignar cuadrilla de zona poniente para Maipú con seguimiento GPS");
        assertThat(resenia.getUsuarioAccionMejora())
                .isEqualTo("Carlos Henríquez - Jefe de Ventas y Operaciones");
        assertThat(resenia.getFechaAccionMejora()).isNotNull();
    }
}


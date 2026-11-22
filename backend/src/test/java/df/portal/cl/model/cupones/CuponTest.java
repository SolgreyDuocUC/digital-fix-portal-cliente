package df.portal.cl.model.cupones;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class CuponTest {

    private static final LocalDate HOY = LocalDate.of(2026, 11, 22);

    private Cupon cupon(TipoDescuento tipo, String valor) {
        return Cupon.builder().codigo("PRUEBA").tipo(tipo).valor(new BigDecimal(valor))
                .fechaInicio(HOY.minusDays(1)).fechaFin(HOY.plusDays(1)).activo(true).build();
    }

    @Test
    void porcentaje_RedondeaAPesos() {
        assertThat(cupon(TipoDescuento.PORCENTAJE, "10").calcularDescuento(new BigDecimal("45990")))
                .isEqualByComparingTo("4599");
    }

    @Test
    void montoFijo_NuncaSuperaElSubtotal() {
        assertThat(cupon(TipoDescuento.MONTO_FIJO, "50000").calcularDescuento(new BigDecimal("30000")))
                .isEqualByComparingTo("30000");
    }

    @Test
    void motivos_VencidoAgotadoYMontoMinimo() {
        Cupon c = cupon(TipoDescuento.PORCENTAJE, "10");
        assertThat(c.motivoNoAplicable(new BigDecimal("1000"), HOY)).isNull();
        assertThat(c.motivoNoAplicable(new BigDecimal("1000"), HOY.plusDays(5))).contains("venció");

        c.setUsosMaximos(1);
        c.registrarUso();
        assertThat(c.motivoNoAplicable(new BigDecimal("1000"), HOY)).contains("límite de usos");

        Cupon conMinimo = cupon(TipoDescuento.PORCENTAJE, "10");
        conMinimo.setMontoMinimo(new BigDecimal("20000"));
        assertThat(conMinimo.motivoNoAplicable(new BigDecimal("1000"), HOY)).contains("compra mínima");
    }
}

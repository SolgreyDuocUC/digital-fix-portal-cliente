package df.portal.cl.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UtilidadesChileTest {

    @Test
    void rut_AceptaFormatosYNormalizaConPuntos() {
        assertThat(RutUtil.normalizar("12.345.678-5")).isEqualTo("12.345.678-5");
        assertThat(RutUtil.normalizar("12345678-5")).isEqualTo("12.345.678-5");
        assertThat(RutUtil.normalizar("123456785")).isEqualTo("12.345.678-5");
        assertThat(RutUtil.normalizar("76543210-3")).isEqualTo("76.543.210-3");
        assertThat(RutUtil.normalizar("1000005-k")).isEqualTo("1.000.005-K");
    }

    @Test
    void rut_RechazaDigitoVerificadorIncorrecto() {
        assertThat(RutUtil.esValido("12.345.678-9")).isFalse();
        assertThat(RutUtil.esValido("abc")).isFalse();
        assertThatThrownBy(() -> RutUtil.normalizar("12.345.678-9")).hasMessageContaining("dígito verificador");
    }

    @Test
    void telefono_NormalizaAlFormatoDeMsWorkorders() {
        assertThat(TelefonoUtil.normalizar("9 1234 5678")).isEqualTo("+56912345678");
        assertThat(TelefonoUtil.normalizar("+56 9 1234 5678")).isEqualTo("+56912345678");
        assertThat(TelefonoUtil.normalizar("56912345678")).isEqualTo("+56912345678");
        assertThatThrownBy(() -> TelefonoUtil.normalizar("12345")).isInstanceOf(IllegalArgumentException.class);
    }
}

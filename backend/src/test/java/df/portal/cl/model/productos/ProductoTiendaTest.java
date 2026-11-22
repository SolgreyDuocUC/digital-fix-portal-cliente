package df.portal.cl.model.productos;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductoTiendaTest {

    @Test
    void vincularImagenGoogleDrive_LinkValido_GeneraUrlDirecta() {
        ProductoTienda producto = ProductoTienda.builder()
                .idProductoTienda(1L)
                .codigo("REP-0001")
                .nombreBase("Interruptor termomagnético 2x16A")
                .precioBase(new BigDecimal("8990"))
                .tipoItem(TipoItemTienda.REPUESTO)
                .stockDisponible(20)
                .build();

        String driveUrl = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2e104/view?usp=sharing";

        producto.vincularImagenGoogleDrive(driveUrl);

        assertThat(producto.getImagenDriveUrl()).isEqualTo(driveUrl);
        assertThat(producto.getImagenDirectaUrl())
                .isEqualTo("https://lh3.googleusercontent.com/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2e104");
        assertThat(producto.getFechaVinculacionImagen()).isNotNull();
    }

    @Test
    void vincularImagenGoogleDrive_FormatoOpenId_ExtraeCorrectamente() {
        ProductoTienda producto = ProductoTienda.builder()
                .idProductoTienda(2L)
                .codigo("REP-0002")
                .nombreBase("Cable THHN 2.5 mm")
                .build();

        String openUrl = "https://drive.google.com/open?id=1234567890abcdef12345678";

        producto.vincularImagenGoogleDrive(openUrl);

        assertThat(producto.getImagenDirectaUrl())
                .isEqualTo("https://lh3.googleusercontent.com/d/1234567890abcdef12345678");
    }

    @Test
    void vincularImagenGoogleDrive_DominioInvalido_LanzaExcepcion() {
        ProductoTienda producto = ProductoTienda.builder()
                .idProductoTienda(3L)
                .codigo("REP-0003")
                .nombreBase("Tablero eléctrico")
                .build();

        String invalidUrl = "https://images.unsplash.com/photo-123456";

        assertThatThrownBy(() -> producto.vincularImagenGoogleDrive(invalidUrl))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Google Drive");
    }

    @Test
    void getPrecioFinal_ConDescuentoMarketing_CalculaCorrectamente() {
        ProductoTienda producto = ProductoTienda.builder()
                .idProductoTienda(4L)
                .precioBase(new BigDecimal("10000"))
                .descuentoPorcentaje(20)
                .build();

        assertThat(producto.getPrecioFinal()).isEqualByComparingTo(new BigDecimal("8000"));
    }

    @Test
    void sincronizarDesdeMicroservicio_PreservaMarketingYDrive() {
        ProductoTienda producto = ProductoTienda.builder()
                .idProductoTienda(5L)
                .idMicroservicio(10L)
                .nombreBase("Nombre Original")
                .precioBase(new BigDecimal("5000"))
                .stockDisponible(2)
                .nombreComercial("Oferta Tablero Master")
                .badgePromocional("MÁS VENDIDO")
                .build();

        producto.vincularImagenGoogleDrive("https://drive.google.com/file/d/abcdef1234567890abcdef/view");

        // Simula actualización de stock y precio desde ms-catalog
        producto.sincronizarDesdeMicroservicio("Nombre Actualizado", "Nueva desc", new BigDecimal("5500"), 15);

        assertThat(producto.getNombreBase()).isEqualTo("Nombre Actualizado");
        assertThat(producto.getStockDisponible()).isEqualTo(15);
        // Preserva marketing
        assertThat(producto.getNombreComercial()).isEqualTo("Oferta Tablero Master");
        assertThat(producto.getBadgePromocional()).isEqualTo("MÁS VENDIDO");
        assertThat(producto.getImagenDirectaUrl()).contains("abcdef1234567890abcdef");
    }
}
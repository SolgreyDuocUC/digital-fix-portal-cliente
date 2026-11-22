package df.portal.cl.dto.productos;

import df.portal.cl.model.productos.ProductoTienda;
import df.portal.cl.model.productos.TipoItemTienda;

import java.math.BigDecimal;

/**
 * DTO para exponer el producto en tienda al cliente y al portal de marketing.
 */
public record ProductoTiendaDTO(
        Long idProductoTienda,
        Long idMicroservicio,
        TipoItemTienda tipoItem,
        String codigo,
        String nombre,
        String descripcion,
        String categoria,
        BigDecimal precioBase,
        BigDecimal precioFinal,
        Integer descuentoPorcentaje,
        Integer stockDisponible,
        boolean tieneStock,
        String unidadMedida,
        boolean certificacionSEC,
        String imagenDriveUrl,
        String imagenDirectaUrl,
        String badgePromocional,
        boolean destacado,
        boolean visibleEnTienda
) {
    public static ProductoTiendaDTO from(ProductoTienda p) {
        return new ProductoTiendaDTO(
                p.getIdProductoTienda(),
                p.getIdMicroservicio(),
                p.getTipoItem(),
                p.getCodigo(),
                p.getNombreParaMostrar(),
                p.getDescripcionParaMostrar(),
                p.getCategoriaTienda(),
                p.getPrecioBase(),
                p.getPrecioFinal(),
                p.getDescuentoPorcentaje(),
                p.getStockDisponible(),
                p.tieneStockDisponible(),
                p.getUnidadMedida(),
                p.isCertificacionSEC(),
                p.getImagenDriveUrl(),
                p.getImagenDirectaUrl(),
                p.getBadgePromocional(),
                p.isDestacado(),
                p.isVisibleEnTienda()
        );
    }
}
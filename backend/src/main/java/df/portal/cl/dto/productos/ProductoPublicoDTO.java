package df.portal.cl.dto.productos;

import df.portal.cl.model.productos.ProductoTienda;
import df.portal.cl.model.productos.TipoItemTienda;

import java.math.BigDecimal;

/**
 * Producto o servicio tal como lo ve el cliente en la tienda. Mantiene los nombres de campo del
 * ProductoCatalogoDTO de ms-catalog (id, codigo, nombre, precio, stock, disponible, marca...) para que
 * el frontend que ya consumía ms-catalog lo lea igual, y agrega la capa comercial de Marketing.
 *
 * "precio" es el precio final (con el descuento de tienda); "precioLista" es el del ERP.
 * No expone datos internos del taller (stock mínimo, proveedores, costos).
 */
public record ProductoPublicoDTO(
        Long id,
        TipoItemTienda tipo,
        String codigo,
        String nombre,
        String descripcion,
        String categoria,
        BigDecimal precio,
        BigDecimal precioLista,
        Integer descuentoPorcentaje,
        Integer stock,
        boolean disponible,
        String unidadMedida,
        boolean certificacionSEC,
        String marca,
        String imagenUrl,
        String badge,
        boolean destacado
) {
    public static ProductoPublicoDTO from(ProductoTienda p) {
        return new ProductoPublicoDTO(
                p.getIdMicroservicio(),
                p.getTipoItem(),
                p.getCodigo(),
                p.getNombreParaMostrar(),
                p.getDescripcionParaMostrar(),
                p.getCategoriaTienda(),
                p.getPrecioFinal(),
                p.getPrecioBase(),
                p.getDescuentoPorcentaje(),
                p.getTipoItem() == TipoItemTienda.SERVICIO ? null : p.getStockDisponible(),
                p.tieneStockDisponible(),
                p.getUnidadMedida(),
                p.isCertificacionSEC(),
                p.getMarca(),
                p.getImagenDirectaUrl(),
                p.getBadgePromocional(),
                p.isDestacado()
        );
    }
}

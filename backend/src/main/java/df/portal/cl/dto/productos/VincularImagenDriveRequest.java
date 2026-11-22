package df.portal.cl.dto.productos;

/**
 * Solicitud del equipo de Marketing para vincular una imagen de Google Drive
 * y ajustar atributos promocionales de un producto en la tienda.
 */
public record VincularImagenDriveRequest(
        String imagenDriveUrl,
        String nombreComercial,
        String descripcionComercial,
        String categoriaTienda,
        String badgePromocional,
        Integer descuentoPorcentaje,
        Boolean destacado,
        Boolean visibleEnTienda
) {
}
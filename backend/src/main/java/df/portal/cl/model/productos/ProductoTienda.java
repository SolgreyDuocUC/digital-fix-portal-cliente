package df.portal.cl.model.productos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;

/**
 * Entidad y modelo para la gestion de productos y servicios expuestos en la tienda del Portal Cliente.
 * Integra la informacion base proveniente de los microservicios centrales (ms-catalog) y permite
 * al equipo de Marketing enriquecerlos con vinculos de imagenes desde Google Drive, badges promocionales,
 * categorias comerciales y descuentos para campanas.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoTienda {

    /** Identificador unico del producto en la tienda del portal */
    private Long idProductoTienda;

    /** ID de referencia en el microservicio central (ms-catalog: idRepuesto o idServicio) */
    private Long idMicroservicio;

    /** Tipo de item: REPUESTO fisico o SERVICIO tecnico en terreno */
    private TipoItemTienda tipoItem;

    /** Codigo SKU visible (ej: REP-0001, SRV-EMG-01) */
    private String codigo;

    /** Nombre tecnico original proveniente del microservicio */
    private String nombreBase;

    /** Descripcion tecnica original proveniente del microservicio */
    private String descripcionBase;

    /** Precio de lista o tarifa oficial en CLP (sin descuento) */
    private BigDecimal precioBase;

    /** Stock fisico disponible consultado en tiempo real desde ms-catalog */
    private Integer stockDisponible;

    /** Unidad de medida (UNIDAD, METRO, ROLLO, CAJA, KIT, VISITA) */
    private String unidadMedida;

    /** Indica si el producto cuenta con certificacion u homologacion SEC oficial */
    private boolean certificacionSEC;

    // =========================================================================
    // Atributos administrados por el Equipo de Marketing (Portal Comercial)
    // =========================================================================

    /** Nombre comercial optimizado para e-commerce (si es nulo, se muestra nombreBase) */
    private String nombreComercial;

    /** Resena comercial o copy promocional redactado por marketing */
    private String descripcionComercial;

    /** Categoria comercial de navegacion en tienda (ej: Tableros & Fuerza, Protecciones, etc.) */
    private String categoriaTienda;

    /**
     * Enlace original compartido de Google Drive vinculado por Marketing.
     * Ejemplo: https://drive.google.com/file/d/1A2B3C4D5E6F.../view?usp=sharing
     */
    private String imagenDriveUrl;

    /**
     * URL directa optimizada para etiquetas <img> generada automaticamente a partir de imagenDriveUrl.
     * Ejemplo: https://lh3.googleusercontent.com/d/1A2B3C4D5E6F...
     */
    private String imagenDirectaUrl;

    /** Distintivo visual (ej: "MAS SOLICITADO", "OFERTA PYME", "CERTIFICADO SEC", "NUEVO") */
    private String badgePromocional;

    /** Porcentaje de descuento promocional (0 a 100), gestionado por marketing */
    private Integer descuentoPorcentaje;

    /** Si es true, el producto se visualiza en el banner principal / carrusel destacado */
    private boolean destacado;

    /** Control de visibilidad en el portal web sin alterar el inventario central del ERP */
    private boolean visibleEnTienda;

    /** Fecha y hora en la que el equipo de marketing vinculo la imagen de Google Drive */
    private OffsetDateTime fechaVinculacionImagen;

    /** Fecha de ultima actualizacion de atributos de tienda */
    private OffsetDateTime fechaActualizacion;

    // =========================================================================
    // Metodos de Negocio para el Equipo de Marketing
    // =========================================================================

    /**
     * Vincula un enlace de imagen proveniente exclusivamente de Google Drive.
     * Valida el dominio y extrae el ID para generar la URL directa de visualizacion.
     *
     * @param driveUrl enlace compartido de Google Drive
     * @throws IllegalArgumentException si la URL no pertenece a Google Drive o es invalida
     */
    public void vincularImagenGoogleDrive(String driveUrl) {
        if (driveUrl == null || driveUrl.isBlank()) {
            removerImagen();
            return;
        }

        // Valida que el enlace provenga de Google Drive y extrae su ID
        String urlDirecta = GoogleDriveUrlHelper.generarUrlDirecta(driveUrl);

        this.imagenDriveUrl = driveUrl.trim();
        this.imagenDirectaUrl = urlDirecta;
        this.fechaVinculacionImagen = OffsetDateTime.now();
        this.fechaActualizacion = OffsetDateTime.now();
    }

    /**
     * Elimina el vinculo de imagen de Google Drive.
     */
    public void removerImagen() {
        this.imagenDriveUrl = null;
        this.imagenDirectaUrl = null;
        this.fechaVinculacionImagen = null;
        this.fechaActualizacion = OffsetDateTime.now();
    }

    /**
     * Actualiza la informacion comercial gestionada por el rol Marketing.
     */
    public void actualizarMarketing(String nombreComercial, String descripcionComercial,
                                   String categoriaTienda, String badgePromocional,
                                   Integer descuentoPorcentaje, boolean destacado, boolean visibleEnTienda) {
        this.nombreComercial = nombreComercial != null && !nombreComercial.isBlank() ? nombreComercial.trim() : null;
        this.descripcionComercial = descripcionComercial != null ? descripcionComercial.trim() : null;
        this.categoriaTienda = categoriaTienda != null ? categoriaTienda.trim() : this.categoriaTienda;
        this.badgePromocional = badgePromocional != null && !badgePromocional.isBlank() ? badgePromocional.trim() : null;
        this.descuentoPorcentaje = (descuentoPorcentaje != null && descuentoPorcentaje >= 0 && descuentoPorcentaje <= 100)
                ? descuentoPorcentaje
                : null;
        this.destacado = destacado;
        this.visibleEnTienda = visibleEnTienda;
        this.fechaActualizacion = OffsetDateTime.now();
    }

    /**
     * Sincroniza datos base desde el microservicio (ms-catalog), preservando
     * las imagenes de Google Drive y configuraciones de Marketing existentes.
     */
    public void sincronizarDesdeMicroservicio(String nombreBase, String descripcionBase,
                                             BigDecimal precioBase, Integer stockDisponible) {
        this.nombreBase = nombreBase;
        this.descripcionBase = descripcionBase;
        this.precioBase = precioBase;
        this.stockDisponible = stockDisponible;
        this.fechaActualizacion = OffsetDateTime.now();
    }

    /**
     * Retorna el nombre visible al cliente (prioriza el nombre comercial de marketing).
     */
    public String getNombreParaMostrar() {
        if (nombreComercial != null && !nombreComercial.isBlank()) {
            return nombreComercial;
        }
        return nombreBase;
    }

    /**
     * Retorna la descripcion visible al cliente (prioriza la comercial de marketing).
     */
    public String getDescripcionParaMostrar() {
        if (descripcionComercial != null && !descripcionComercial.isBlank()) {
            return descripcionComercial;
        }
        return descripcionBase;
    }

    /**
     * Calcula el precio final en CLP aplicando el descuento comercial de marketing (si existe).
     */
    public BigDecimal getPrecioFinal() {
        if (precioBase == null) {
            return BigDecimal.ZERO;
        }
        if (descuentoPorcentaje == null || descuentoPorcentaje <= 0) {
            return precioBase;
        }
        BigDecimal factor = BigDecimal.valueOf(100 - descuentoPorcentaje).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        return precioBase.multiply(factor).setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * Retorna si el producto tiene stock real disponible para la venta inmediata.
     */
    public boolean tieneStockDisponible() {
        if (tipoItem == TipoItemTienda.SERVICIO) {
            return true; // Los servicios se coordinan por agenda tecnica
        }
        return stockDisponible != null && stockDisponible > 0;
    }
}
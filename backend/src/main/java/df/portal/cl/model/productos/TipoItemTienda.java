package df.portal.cl.model.productos;

/**
 * Distingue el tipo de item ofrecido en la tienda del Portal Cliente.
 */
public enum TipoItemTienda {
    /** Repuesto o insumo fisico (con control de inventario en ms-catalog). */
    REPUESTO,

    /** Servicio tecnico, visita de urgencia o certificacion SEC en terreno. */
    SERVICIO
}
package df.portal.cl.model.resenias;

/**
 * Estado de moderación y visibilidad de la reseña en el portal web público.
 */
public enum EstadoResenia {
    /** Visible públicamente en la ficha del producto o servicio en el portal. */
    PUBLICADA,

    /** Requiere moderación previa por el equipo comercial antes de mostrarse. */
    PENDIENTE_MODERACION,

    /** Oculta de la tienda por contenido inapropiado o solicitud administrativa. */
    OCULTA
}


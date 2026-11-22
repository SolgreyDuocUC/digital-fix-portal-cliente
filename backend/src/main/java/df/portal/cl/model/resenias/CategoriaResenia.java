package df.portal.cl.model.resenias;

/**
 * Clasificación de la reseña para análisis comercial y operacional por parte
 * del Asistente de Operaciones Comerciales y el Jefe de Ventas y Operaciones.
 */
public enum CategoriaResenia {
    /** Calificaciones de 4 o 5 estrellas reconociendo pericia técnica y puntualidad. */
    FELICITACION,

    /** Calificaciones medias (3 estrellas) o sugerencias operativas del cliente. */
    MEJORA,

    /** Reclamos o calificaciones bajas (1 o 2 estrellas) que requieren plan de acción correctivo. */
    CRITICA;

    /**
     * Deduce la categoría a partir de la cantidad de estrellas (1 a 5).
     */
    public static CategoriaResenia inferirPorEstrellas(int estrellas) {
        if (estrellas >= 4) {
            return FELICITACION;
        } else if (estrellas == 3) {
            return MEJORA;
        } else {
            return CRITICA;
        }
    }
}


package df.portal.cl.model.productos;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utilidad de validacion y transformacion de enlaces de imagenes provenientes de Google Drive.
 * Permite que el equipo de marketing pegue cualquier enlace compartido de Google Drive y el sistema
 * lo transforme automaticamente en una URL directa incrustable en etiquetas <img> del portal.
 */
public final class GoogleDriveUrlHelper {

    private static final Pattern DRIVE_DOMAIN_PATTERN = Pattern.compile(
            "^(https?:\\/\\/)?(drive|docs)\\.google\\.com\\/.*",
            Pattern.CASE_INSENSITIVE
    );

    // Captura el ID del archivo en formatos:
    // 1. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // 2. https://drive.google.com/open?id=FILE_ID
    // 3. https://drive.google.com/uc?id=FILE_ID
    // 4. https://docs.google.com/uc?id=FILE_ID
    private static final Pattern FILE_ID_PATTERN = Pattern.compile(
            "(?:\\/file\\/d\\/|\\/d\\/|[?&]id=)([a-zA-Z0-9_-]{15,})",
            Pattern.CASE_INSENSITIVE
    );

    private GoogleDriveUrlHelper() {
        // Clase utilitaria
    }

    /**
     * Valida si una URL pertenece al dominio oficial de Google Drive.
     */
    public static boolean esEnlaceGoogleDrive(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        return DRIVE_DOMAIN_PATTERN.matcher(url.trim()).matches();
    }

    /**
     * Extrae el identificador unico del archivo desde un enlace compartido de Google Drive.
     *
     * @param url enlace copiado de Google Drive
     * @return ID del archivo
     * @throws IllegalArgumentException si el enlace no es de Google Drive o no contiene un ID valido
     */
    public static String extraerIdArchivo(String url) {
        if (!esEnlaceGoogleDrive(url)) {
            throw new IllegalArgumentException(
                    "El vinculo de la imagen debe provenir de Google Drive (ej: https://drive.google.com/file/d/...)"
            );
        }

        Matcher matcher = FILE_ID_PATTERN.matcher(url.trim());
        if (matcher.find()) {
            return matcher.group(1);
        }

        throw new IllegalArgumentException(
                "No se pudo extraer el ID del archivo desde el vinculo de Google Drive proporcionado: " + url
        );
    }

    /**
     * Transforma un enlace compartido de Google Drive en una URL directa para renderizado en el navegador.
     * Utiliza el endpoint de visualizacion directa de Google Drive CDN.
     *
     * @param url enlace compartido de Google Drive
     * @return URL directa incrustable (https://lh3.googleusercontent.com/d/FILE_ID)
     */
    public static String generarUrlDirecta(String url) {
        String fileId = extraerIdArchivo(url);
        // Formato CDN oficial para renderizado web directo sin redireccion ni cookies de descarga
        return "https://lh3.googleusercontent.com/d/" + fileId;
    }

    /**
     * Retorna la URL de visualizacion alternativa export=view.
     */
    public static String generarUrlExportView(String url) {
        String fileId = extraerIdArchivo(url);
        return "https://drive.google.com/uc?export=view&id=" + fileId;
    }
}
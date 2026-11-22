/**
 * Utilidades para manejo, validación y resolución de enlaces de imágenes desde Google Drive.
 * Permite que el equipo de marketing vincule imágenes directamente usando enlaces compartidos.
 */

const DRIVE_DOMAIN_REGEX = /^(https?:\/\/)?(drive|docs)\.google\.com\/.+/i;

const FILE_ID_REGEX = /(?:\/file\/d\/|\/d\/|[?&]id=)([a-zA-Z0-9_-]{15,})/i;

/**
 * Comprueba si una URL pertenece al dominio de Google Drive.
 */
export function isGoogleDriveUrl(url?: string | null): boolean {
  if (!url) return false;
  return DRIVE_DOMAIN_REGEX.test(url.trim());
}

/**
 * Extrae el File ID único de un enlace de Google Drive.
 * Soporta:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function extractDriveFileId(url?: string | null): string | null {
  if (!url || !isGoogleDriveUrl(url)) return null;
  const match = url.trim().match(FILE_ID_REGEX);
  return match ? match[1] : null;
}

/**
 * Transforma un enlace de Google Drive en una URL directa de imagen CDN incrustable en <img>.
 * Si la URL no es de Google Drive, retorna la URL original sin modificaciones.
 */
export function resolveDriveImageUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    // Formato CDN oficial de Google para incrustación directa
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return trimmed;
}

/**
 * Retorna URL alternativa export=view para casos donde se prefiera endpoint directo de Google Drive.
 */
export function toDriveExportViewUrl(url?: string | null): string {
  if (!url) return "";
  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return url.trim();
}


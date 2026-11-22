import React, { useState } from "react";
import { resolveDriveImageUrl } from "@/utils/googleDrive";

interface ImageSlotProps {
  src?: string;
  alt?: string;
  className?: string;
  /** Se mantiene por compatibilidad con los datos del catálogo; ya no se dibuja un ícono. */
  iconType?: string;
}

/**
 * Espacio de imagen para productos y servicios:
 * - Resuelve enlaces compartidos de Google Drive a la URL directa de la imagen.
 * - Sin imagen (o si falla la carga) muestra un recuadro plano de marca con el nombre del ítem,
 *   sin íconos ni degradados.
 */
export const ImageSlot: React.FC<ImageSlotProps> = ({ src, alt = "", className = "aspect-[4/3]" }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveDriveImageUrl(src);

  return (
    <div className={`w-full overflow-hidden bg-brand-50 relative flex items-center justify-center ${className}`}>
      {resolvedSrc && !hasError ? (
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="px-4 text-center text-xs font-semibold uppercase tracking-[0.06em] text-brand-500 line-clamp-2 select-none">
          {alt || "DigitalFix"}
        </span>
      )}
    </div>
  );
};

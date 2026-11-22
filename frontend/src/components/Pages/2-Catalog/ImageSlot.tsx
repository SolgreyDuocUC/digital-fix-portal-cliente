import React from "react";

interface ImageSlotProps {
  src?: string;
  alt?: string;
  className?: string;
}

/** Espacio para imágenes: muestra la foto si existe, o un marcador celeste si aún no. */
export const ImageSlot: React.FC<ImageSlotProps> = ({
  src,
  alt = "",
  className = "aspect-[4/3]",
}) => (
  <div className={`w-full overflow-hidden bg-sky-50 ${className}`}>
    {src ? (
      <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-xs text-sky-400 border border-dashed border-sky-200">
        Imagen
      </div>
    )}
  </div>
);

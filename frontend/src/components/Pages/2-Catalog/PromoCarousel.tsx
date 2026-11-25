import React, { useState, useEffect, useCallback } from "react";

export interface CarouselSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  /** Pega aquí el link de la imagen que te pase marketing (ideal 1600x600px para PC) */
  imageUrl: string;
  /** Opcional: link de imagen vertical/cuadrada si marketing te pasa una versión especial para celular */
  mobileImageUrl?: string;
  ctaLabel: string;
  onAction: () => void;
}

interface PromoCarouselProps {
  slides: CarouselSlide[];
  autoPlayMs?: number;
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({
  slides,
  autoPlayMs = 6000,
}) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const total = slides.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(next, autoPlayMs);
    return () => clearInterval(timer);
  }, [total, isPaused, autoPlayMs, next]);

  if (total === 0) return null;

  const activeSlide = slides[current];
  const hasValidImage =
    Boolean(activeSlide.imageUrl) && !failedImages[activeSlide.id];

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones y novedades"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-950 via-brand-800 to-brand-600 text-white shadow-md border border-brand-700/40 select-none"
    >
      {/* Contenedor con altura responsiva: cómoda en móvil, imponente en PC */}
      <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] flex items-center">
        {/* Imagen de fondo (si existe y carga bien) */}
        {hasValidImage && (
          <picture className="absolute inset-0 w-full h-full">
            {activeSlide.mobileImageUrl && (
              <source
                media="(max-width: 639px)"
                srcSet={activeSlide.mobileImageUrl}
              />
            )}
            <img
              src={activeSlide.imageUrl}
              alt={activeSlide.title}
              onError={() =>
                setFailedImages((prev) => ({ ...prev, [activeSlide.id]: true }))
              }
              className="w-full h-full object-cover object-center transition-opacity duration-500"
            />
          </picture>
        )}

        {/* Capa de contraste para que el texto blanco siempre sea 100% legible sobre cualquier foto */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            hasValidImage
              ? "bg-gradient-to-r from-brand-950/90 via-brand-900/70 to-brand-900/20"
              : "bg-gradient-to-tr from-brand-950/40 to-transparent"
          }`}
        />

        {/* Contenido del slide activo */}
        <div className="relative z-10 w-full px-6 py-10 sm:px-10 lg:px-14 max-w-3xl space-y-3 sm:space-y-4 animate-fadeIn">
          {activeSlide.badge && (
            <span className="inline-flex items-center px-3 py-1 rounded-md bg-white text-brand-800 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-xs">
              {activeSlide.badge}
            </span>
          )}

          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.15]">
            {activeSlide.title}
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-brand-100 max-w-xl leading-relaxed">
            {activeSlide.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={activeSlide.onAction}
              className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-xl bg-white hover:bg-brand-50 text-brand-800 text-sm font-bold shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              {activeSlide.ctaLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Controles inferiores (Anterior / Indicadores / Siguiente) - Sin íconos SVG */}
      {total > 1 && (
        <div className="relative z-20 px-6 sm:px-10 lg:px-14 pb-4 flex items-center justify-between gap-4">
          {/* Indicadores de progreso */}
          <div className="flex items-center gap-2" role="tablist">
            {slides.map((slide, idx) => {
              const isSelected = idx === current;
              return (
                <button
                  key={slide.id}
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={`Ir a diapositiva ${idx + 1}: ${slide.title}`}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 rounded-sm transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "w-8 bg-white"
                      : "w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>

          {/* Botones de navegación textuales/limpios */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prev}
              aria-label="Anterior"
              className="h-8 px-3 rounded-lg bg-brand-950/60 hover:bg-brand-950/90 border border-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Siguiente"
              className="h-8 px-3 rounded-lg bg-brand-950/60 hover:bg-brand-950/90 border border-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
import React from "react";
import { Container } from "./PageShell";
import { ImageSlot } from "./ImageSlot";

interface HeroAction {
  label: string;
  onClick: () => void;
  /** Se conserva por compatibilidad; el portal no muestra íconos. */
  icon?: string;
}

interface HeroBannerProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  imageSrc?: string;
}

/** Portada: fondo plano de marca, texto sobrio y dos acciones estándar. */
export const HeroBanner: React.FC<HeroBannerProps> = ({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
}) => (
  <section className="bg-brand-50 border-b border-brand-100 pb-16 sm:pb-20">
    <Container className="pt-10 sm:pt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4 max-w-xl">
          {eyebrow && <span className="eyebrow text-brand-600">{eyebrow}</span>}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">{title}</h1>
          <p className="text-[15px] text-slate-600 leading-relaxed">{description}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button onClick={primaryAction.onClick} className="btn-primary min-h-[42px] px-5">
              {primaryAction.label}
            </button>
            {secondaryAction && (
              <button onClick={secondaryAction.onClick} className="btn-secondary min-h-[42px] px-5">
                {secondaryAction.label}
              </button>
            )}
          </div>
        </div>

        {imageSrc && (
          <div className="hidden md:flex justify-center">
            <ImageSlot src={imageSrc} alt={title} className="max-w-md aspect-[4/3] rounded-2xl border border-brand-100" />
          </div>
        )}
      </div>
    </Container>
  </section>
);

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { Container } from "./PageShell";
import { ImageSlot } from "./ImageSlot";

interface HeroAction {
  label: string;
  onClick: () => void;
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

export const HeroBanner: React.FC<HeroBannerProps> = ({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
}) => (
  <section className="bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 pb-16 sm:pb-20">
    <Container className="pt-8 sm:pt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 max-w-xl">
          {eyebrow && <span className="text-xs font-semibold text-blue-700">{eyebrow}</span>}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{description}</p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={primaryAction.onClick}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-md transition"
            >
              {primaryAction.label}
            </button>
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="bg-white hover:bg-sky-50 text-blue-700 text-sm font-semibold px-5 py-3 rounded-md transition flex items-center gap-2 shadow-sm"
              >
                {secondaryAction.icon && <Icon name={secondaryAction.icon} size={15} />}
                <span>{secondaryAction.label}</span>
              </button>
            )}
          </div>
        </div>

        <div className="hidden md:flex justify-center">
          <ImageSlot src={imageSrc} alt={title} className="max-w-md aspect-[4/3] rounded-2xl" />
        </div>
      </div>
    </Container>
  </section>
);

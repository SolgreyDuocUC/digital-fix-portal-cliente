import React from "react";

export interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  onClick: () => void;
}

interface QuickAccessListProps {
  heading?: string;
  items: QuickAccessItem[];
}

/**
 * Lista corporativa de accesos rápidos (patrón DigitalFix: filas limpias con título,
 * descripción breve y acción textual a la derecha, sin íconos).
 */
export const QuickAccessList: React.FC<QuickAccessListProps> = ({
  heading = "ACCESOS RÁPIDOS",
  items,
}) => {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3" aria-label={heading}>
      <h2 className="eyebrow px-0.5">{heading}</h2>

      <div className="space-y-2.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="group w-full text-left panel-interactive px-5 py-4 sm:px-6 sm:py-4.5 flex items-center justify-between gap-4 cursor-pointer"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                {item.title}
              </p>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>

            <span className="shrink-0 text-[13px] font-semibold text-brand-600 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all">
              {item.actionLabel ?? "Ingresar"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
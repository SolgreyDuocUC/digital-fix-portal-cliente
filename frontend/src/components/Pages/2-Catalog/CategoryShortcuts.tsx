import React from "react";
import { QuickCategory } from "@/types/catalog";

interface CategoryShortcutsProps {
  categories: QuickCategory[];
  onSelect: (category: QuickCategory) => void;
}

/** Accesos por categoría: tarjetas de texto, sin imágenes ni íconos. */
export const CategoryShortcuts: React.FC<CategoryShortcutsProps> = ({ categories, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    {categories.map((c) => (
      <button
        key={c.name}
        onClick={() => onSelect(c)}
        className="panel p-4 text-left flex flex-col gap-3 transition-colors hover:border-brand-300 cursor-pointer"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-[13px] text-slate-900 truncate">{c.label}</span>
          <span className="block text-xs text-slate-500 truncate mt-0.5">{c.subtitle}</span>
        </span>
        <span className="text-xs font-semibold text-brand-600">Ver opciones</span>
      </button>
    ))}
  </div>
);

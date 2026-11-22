import React from "react";
import { QuickCategory } from "@/types/catalog";
import { ImageSlot } from "./ImageSlot";

interface CategoryShortcutsProps {
  categories: QuickCategory[];
  onSelect: (category: QuickCategory) => void;
}

export const CategoryShortcuts: React.FC<CategoryShortcutsProps> = ({
  categories,
  onSelect,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    {categories.map((c) => (
      <button
        key={c.name}
        onClick={() => onSelect(c)}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 text-left flex flex-col gap-3"
      >
        <div>
          <h3 className="font-semibold text-sm text-slate-800 truncate">{c.label}</h3>
          <span className="text-xs text-slate-400 block truncate">{c.subtitle}</span>
        </div>
        <ImageSlot alt={c.label} className="aspect-[16/10] rounded-md" />
      </button>
    ))}
  </div>
);

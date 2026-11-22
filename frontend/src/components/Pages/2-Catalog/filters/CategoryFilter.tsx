import React from "react";
import { FilterGroup } from "./FilterSidebar";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selected,
  onSelect,
}) => (
  <FilterGroup title="Categorías">
    <div className="flex flex-col">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`text-left py-1.5 text-[13px] transition ${
            selected === cat
              ? "text-blue-700 font-semibold"
              : "text-slate-600 hover:text-blue-600"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  </FilterGroup>
);

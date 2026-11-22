import React from "react";
import { FilterGroup } from "./FilterSidebar";

interface StockFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const StockFilter: React.FC<StockFilterProps> = ({
  checked,
  onChange,
  label = "Solo con stock",
}) => (
  <FilterGroup title="Disponibilidad">
    <label className="flex items-center gap-2 text-slate-700 cursor-pointer text-[13px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-sky-300 text-blue-600 focus:ring-blue-500"
      />
      <span>{label}</span>
    </label>
  </FilterGroup>
);

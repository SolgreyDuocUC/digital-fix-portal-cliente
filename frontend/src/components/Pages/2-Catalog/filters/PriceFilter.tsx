import React from "react";
import { formatPrice } from "@/utils/currency";
import { FilterGroup } from "./FilterSidebar";

interface PriceFilterProps {
  value: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export const PriceFilter: React.FC<PriceFilterProps> = ({ value, max, step, onChange }) => (
  <FilterGroup
    title="Precio hasta"
    aside={<span className="text-blue-700 font-semibold text-[13px]">{formatPrice(value)}</span>}
  >
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-blue-600 cursor-pointer"
    />
  </FilterGroup>
);

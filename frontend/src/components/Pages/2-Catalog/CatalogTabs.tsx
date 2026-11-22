import React from "react";
import { CatalogView } from "@/types/catalog";

const TABS: { view: CatalogView; label: string }[] = [
  { view: "home", label: "Inicio" },
  { view: "services", label: "Servicios" },
  { view: "products", label: "Repuestos" },
];

interface CatalogTabsProps {
  active: CatalogView;
  onChange: (view: CatalogView) => void;
}

export const CatalogTabs: React.FC<CatalogTabsProps> = ({ active, onChange }) => (
  <nav className="bg-white border-b border-slate-200" aria-label="Secciones del catálogo">
    <div className="max-w-7xl mx-auto px-4 flex gap-6">
      {TABS.map((tab) => (
        <button
          key={tab.view}
          onClick={() => onChange(tab.view)}
          aria-current={active === tab.view ? "page" : undefined}
          className={`h-11 text-[13px] border-b-2 -mb-px transition-colors cursor-pointer ${
            active === tab.view
              ? "border-brand-600 text-brand-600 font-semibold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </nav>
);

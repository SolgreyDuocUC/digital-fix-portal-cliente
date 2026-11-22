import React from "react";
import { CatalogView } from "@/types/catalog";

const TABS: { view: CatalogView; label: string }[] = [
  { view: "home", label: "Inicio" },
  { view: "services", label: "Servicios" },
  { view: "products", label: "Productos" },
];

interface CatalogTabsProps {
  active: CatalogView;
  onChange: (view: CatalogView) => void;
}

export const CatalogTabs: React.FC<CatalogTabsProps> = ({ active, onChange }) => (
  <nav className="bg-white border-b border-sky-100" aria-label="Secciones del catálogo">
    <div className="max-w-7xl mx-auto px-4 flex gap-6">
      {TABS.map((tab) => (
        <button
          key={tab.view}
          onClick={() => onChange(tab.view)}
          aria-current={active === tab.view ? "page" : undefined}
          className={`py-3 text-sm border-b-2 -mb-px transition ${
            active === tab.view
              ? "border-blue-600 text-blue-700 font-semibold"
              : "border-transparent text-slate-600 hover:text-blue-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </nav>
);

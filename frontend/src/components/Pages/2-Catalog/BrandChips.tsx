import React from "react";

export const BrandChips: React.FC<{ brands: string[] }> = ({ brands }) => (
  <section className="bg-white rounded-lg shadow-sm px-5 py-4">
    <h2 className="text-sm font-semibold text-slate-800 mb-3">Marcas homologadas</h2>
    <div className="flex flex-wrap gap-2">
      {brands.map((b) => (
        <span key={b} className="text-xs text-blue-700 bg-sky-50 px-3 py-1.5 rounded-full">
          {b}
        </span>
      ))}
    </div>
  </section>
);

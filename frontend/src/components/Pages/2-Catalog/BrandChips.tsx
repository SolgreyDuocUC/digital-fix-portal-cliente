import React from "react";

export const BrandChips: React.FC<{ brands: string[] }> = ({ brands }) => (
  <section className="panel px-5 py-4">
    <h2 className="eyebrow mb-3">Marcas homologadas</h2>
    <div className="flex flex-wrap gap-2">
      {brands.map((b) => (
        <span key={b} className="badge bg-slate-100 text-slate-700">
          {b}
        </span>
      ))}
    </div>
  </section>
);

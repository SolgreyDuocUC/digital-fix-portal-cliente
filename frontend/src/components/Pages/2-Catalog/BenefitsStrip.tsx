import React from "react";

export const BenefitsStrip: React.FC<{ items: string[] }> = ({ items }) => (
  <section className="panel grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 overflow-hidden">
    {items.map((text) => (
      <span key={text} className="px-5 py-4 text-xs font-medium text-slate-600">
        {text}
      </span>
    ))}
  </section>
);

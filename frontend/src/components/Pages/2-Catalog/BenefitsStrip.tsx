import React from "react";

export const BenefitsStrip: React.FC<{ items: string[] }> = ({ items }) => (
  <section className="bg-white rounded-lg shadow-sm px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
    {items.map((text) => (
      <span key={text}>{text}</span>
    ))}
  </section>
);

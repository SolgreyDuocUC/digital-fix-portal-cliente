import React, { ReactNode } from "react";

export const FilterSidebar: React.FC<{ children: ReactNode }> = ({ children }) => (
  <aside className="bg-white rounded-lg shadow-sm p-5 text-sm divide-y divide-sky-100">
    {children}
  </aside>
);

interface FilterGroupProps {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ title, aside, children }) => (
  <div className="py-4 first:pt-0 last:pb-0 space-y-2">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {aside}
    </div>
    {children}
  </div>
);

import React, { ReactNode } from "react";

interface CatalogLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export const CatalogLayout: React.FC<CatalogLayoutProps> = ({ sidebar, children }) => (
  <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <div className="lg:col-span-3">{sidebar}</div>
    <main className="lg:col-span-9 space-y-4">{children}</main>
  </section>
);

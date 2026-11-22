import React, { useState } from "react";
import { CommercialHubView } from "./CommercialHubView";
import { QuotesListView } from "./QuotesListView";
import { QuoteCreationForm } from "./QuoteCreationForm";
import { OperationalCatalogEnricher } from "../9-Vista-Marketing/OperationalCatalogEnricher";
import { ReviewsAnalyticsView } from "../12-Reviews/ReviewsAnalyticsView";
import { SalesHeadPortalView } from "../11-SalesHead/SalesHeadPortalView";

type VendorSubView =
  | "hub"
  | "quotes"
  | "create-quote"
  | "enrichment"
  | "reviews"
  | "kpis";

export const VendorPortalView: React.FC = () => {
  const [subView, setSubView] = useState<VendorSubView>("hub");

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Barra de Navegación del Módulo Comercial (Breadcrumb / Pestañas de función) */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-semibold">
          <button
            onClick={() => setSubView("hub")}
            className="hover:text-blue-600 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Módulo de Ventas & Operaciones</span>
          </button>
          <span>/</span>
          <span className="text-slate-900 font-bold">
            {subView === "hub" && "Accesos Rápidos"}
            {subView === "quotes" && "Solicitudes de Cotización"}
            {subView === "create-quote" && "Nueva Solicitud"}
            {subView === "enrichment" && "Catálogo & Marketing"}
            {subView === "reviews" && "Reseñas & Oportunidades"}
            {subView === "kpis" && "KPIs & Reportes"}
          </span>
        </div>

        {/* Accesos de Navegación Rápida */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubView("hub")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              subView === "hub"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Hub
          </button>
          <button
            onClick={() => setSubView("quotes")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              subView === "quotes"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Cotizaciones
          </button>
          <button
            onClick={() => setSubView("create-quote")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              subView === "create-quote"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            + Nueva Solicitud
          </button>
          <button
            onClick={() => setSubView("enrichment")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              subView === "enrichment"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Catálogo & Marketing
          </button>
          <button
            onClick={() => setSubView("reviews")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              subView === "reviews"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Reseñas & Críticas
          </button>
          <button
            onClick={() => setSubView("kpis")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              subView === "kpis"
                ? "bg-brand-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            KPIs
          </button>
        </div>
      </div>

      {/* Renderizado de la Sub-vista */}
      {subView === "hub" && (
        <CommercialHubView onNavigate={(viewId) => setSubView(viewId)} />
      )}

      {subView === "quotes" && (
        <QuotesListView onCreateNew={() => setSubView("create-quote")} />
      )}

      {subView === "create-quote" && (
        <QuoteCreationForm
          onBack={() => setSubView("quotes")}
          onSuccess={() => setSubView("quotes")}
        />
      )}

      {subView === "enrichment" && <OperationalCatalogEnricher />}

      {subView === "reviews" && <ReviewsAnalyticsView />}

      {subView === "kpis" && <SalesHeadPortalView />}
    </div>
  );
};

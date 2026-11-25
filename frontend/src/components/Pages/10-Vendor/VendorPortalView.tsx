import React, { useState, useEffect } from "react";
import { CommercialHubView, VendorSubView } from "./CommercialHubView";
import { QuotesListView } from "./QuotesListView";
import { QuoteCreationForm } from "./QuoteCreationForm";
import { OperationalCatalogEnricher } from "../9-Vista-Marketing/OperationalCatalogEnricher";
import { ReviewsAnalyticsView } from "../12-Reviews/ReviewsAnalyticsView";
import { SalesHeadPortalView } from "../11-SalesHead/SalesHeadPortalView";

interface VendorPortalViewProps {
  initialSubView?: VendorSubView;
}

const VIEW_LABELS: Record<VendorSubView, string> = {
  hub: "Accesos Rápidos",
  quotes: "Solicitudes de Cotización",
  "create-quote": "Nueva Solicitud",
  enrichment: "Catálogo e Imágenes",
  reviews: "Reseñas y Oportunidades",
  kpis: "KPIs y Reportes",
};

export const VendorPortalView: React.FC<VendorPortalViewProps> = ({
  initialSubView = "hub",
}) => {
  const [subView, setSubView] = useState<VendorSubView>(initialSubView);

  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Barra superior de navegación tipo breadcrumb */}
      <div className="panel px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSubView("hub")}
            className="font-semibold text-slate-600 hover:text-brand-600 transition-colors cursor-pointer"
          >
            Módulo de Ventas y Operaciones
          </button>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-slate-900">{VIEW_LABELS[subView]}</span>
        </div>

        {/* Píldoras compactas de cambio rápido */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "hub", label: "Hub" },
              { id: "quotes", label: "Cotizaciones" },
              { id: "create-quote", label: "+ Nueva Solicitud" },
              { id: "enrichment", label: "Catálogo e Imágenes" },
              { id: "reviews", label: "Reseñas" },
              { id: "kpis", label: "KPIs" },
            ] as const
          ).map((pill) => {
            const active = subView === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSubView(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {subView === "hub" && <CommercialHubView onNavigate={(viewId) => setSubView(viewId)} />}

      {subView === "quotes" && <QuotesListView onCreateNew={() => setSubView("create-quote")} />}

      {subView === "create-quote" && (
        <QuoteCreationForm
          onBack={() => setSubView("quotes")}
          onSuccess={() => setSubView("quotes")}
        />
      )}

      {subView === "enrichment" && <OperationalCatalogEnricher embedded />}

      {subView === "reviews" && <ReviewsAnalyticsView embedded />}

      {subView === "kpis" && <SalesHeadPortalView initialSubView="kpis" embedded />}
    </div>
  );
};

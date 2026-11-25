import React, { useState, useEffect } from "react";
import { CommercialHubView, VendorSubView } from "./CommercialHubView";
import { QuotesListView } from "./QuotesListView";
import { QuoteCreationForm } from "./QuoteCreationForm";
import { OperationalCatalogEnricher } from "../9-Vista-Marketing/OperationalCatalogEnricher";
import { ReviewsAnalyticsView } from "../12-Reviews/ReviewsAnalyticsView";
import { SalesHeadPortalView } from "../11-SalesHead/SalesHeadPortalView";
import { ExecutiveSection } from "@/components/Layout/ExecutiveShell";

interface VendorPortalViewProps {
  initialSubView?: VendorSubView;
  onNavigateSection?: (section: ExecutiveSection) => void;
}

const SUBVIEW_TO_SECTION: Record<VendorSubView, ExecutiveSection> = {
  hub: "ventas-hub",
  quotes: "ventas-cotizaciones",
  "create-quote": "ventas-nueva",
  enrichment: "mkt-catalogo",
  reviews: "mkt-resenas",
  kpis: "jefatura-reportes",
};

export const VendorPortalView: React.FC<VendorPortalViewProps> = ({
  initialSubView = "hub",
  onNavigateSection,
}) => {
  const [subView, setSubView] = useState<VendorSubView>(initialSubView);

  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);

  const navigate = (next: VendorSubView) => {
    setSubView(next);
    onNavigateSection?.(SUBVIEW_TO_SECTION[next]);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {subView === "hub" && <CommercialHubView onNavigate={navigate} />}

      {subView === "quotes" && <QuotesListView onCreateNew={() => navigate("create-quote")} />}

      {subView === "create-quote" && (
        <QuoteCreationForm
          onBack={() => navigate("quotes")}
          onSuccess={() => navigate("quotes")}
        />
      )}

      {subView === "enrichment" && <OperationalCatalogEnricher embedded />}

      {subView === "reviews" && <ReviewsAnalyticsView embedded />}

      {subView === "kpis" && <SalesHeadPortalView initialSubView="kpis" embedded />}
    </div>
  );
};

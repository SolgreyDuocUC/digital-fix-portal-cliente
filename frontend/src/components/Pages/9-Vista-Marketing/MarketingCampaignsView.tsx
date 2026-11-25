import React, { useEffect, useMemo, useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/utils/currency";
import { OperationalCatalogEnricher } from "./OperationalCatalogEnricher";
import { ReviewsAnalyticsView } from "../12-Reviews/ReviewsAnalyticsView";
import { QuickAccessList, QuickAccessItem } from "@/components/ui/QuickAccessList";
import { ExecutiveSection } from "@/components/Layout/ExecutiveShell";
import { CampaignForm, CampaignDraft } from "./CampaignForm";

export type MktSubView = "hub" | "new-campaign" | "history" | "enrichment" | "reviews";

interface MarketingCampaignsViewProps {
  initialSubView?: MktSubView;
  onNavigateSection?: (section: ExecutiveSection) => void;
}

const SUBVIEW_TO_SECTION: Record<MktSubView, ExecutiveSection> = {
  hub: "mkt-hub",
  "new-campaign": "mkt-nueva",
  history: "mkt-campanas",
  enrichment: "mkt-catalogo",
  reviews: "mkt-resenas",
};

const STATUS_BADGE: Record<string, string> = {
  APROBADA: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  RECHAZADA: "bg-red-50 text-red-700 border border-red-200",
};

export const MarketingCampaignsView: React.FC<MarketingCampaignsViewProps> = ({
  initialSubView = "hub",
  onNavigateSection,
}) => {
  const { user } = useAuth();
  const { campaigns, createCampaign, operationalItems } = useCommercial();

  const [subView, setSubView] = useState<MktSubView>(initialSubView);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);

  const navigate = (next: MktSubView) => {
    setSubView(next);
    onNavigateSection?.(SUBVIEW_TO_SECTION[next]);
  };

  const stats = useMemo(() => {
    const approved = campaigns.filter((c) => c.status === "APROBADA").length;
    const pending = campaigns.filter(
      (c) => c.status !== "APROBADA" && c.status !== "RECHAZADA"
    ).length;
    return { total: campaigns.length, approved, pending };
  }, [campaigns]);

  const handleSaveCampaign = (draft: CampaignDraft, action: "draft" | "submit") => {
    const associated = operationalItems.filter((it) =>
      draft.lines.some((l) => l.itemId === it.id)
    );
    const regularPrice = associated.reduce((acc, it) => acc + it.salePrice, 0);

    let promoPrice = 0;
    for (const line of draft.lines) {
      const item = associated.find((i) => i.id === line.itemId);
      if (!item) continue;
      if (draft.type === "FIXED_PRICE") {
        promoPrice += line.value;
      } else {
        promoPrice += Math.round(item.salePrice * (1 - line.value / 100));
      }
    }

    const discountPercentage =
      regularPrice > 0
        ? Math.max(0, Math.round(((regularPrice - promoPrice) / regularPrice) * 100))
        : 0;

    const firstImage =
      associated.find((i) => i.imageUrl)?.imageUrl ||
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80";

    createCampaign({
      createdBy: `${user?.fullName || "Marketing"} (${user?.department || "Operaciones Comerciales"})`,
      title: draft.name.trim(),
      description: draft.description.trim() || "Campaña promocional comercial.",
      associatedItemIds: associated.map((i) => i.id),
      associatedItemNames: associated.map((i) => i.name),
      discountPercentage,
      promoPrice,
      regularPrice,
      validUntil: draft.endDate,
      referencePhotoUrl: firstImage,
    });

    setToastMessage(
      action === "submit"
        ? "Solicitud registrada y enviada a Jefatura de Ventas para aprobación."
        : "Borrador de campaña registrado."
    );
    navigate("history");
    setTimeout(() => setToastMessage(null), 5000);
  };

  const quickAccessItems: QuickAccessItem[] = [
    {
      id: "new-campaign",
      title: "Registro de Nueva Campaña Promocional",
      description:
        "Formulario comercial para asociar servicios o repuestos, definir descuentos, vigencia y público.",
      onClick: () => navigate("new-campaign"),
    },
    {
      id: "history",
      title: `Registro y Estado de Campañas (${stats.total})`,
      description: `Listado de solicitudes comerciales enviadas a Jefatura de Ventas (${stats.approved} activas · ${stats.pending} en revisión).`,
      onClick: () => navigate("history"),
    },
    {
      id: "enrichment",
      title: "Catálogo e Imágenes de Productos y Servicios",
      description:
        "Enriquecimiento visual con fotografías obligatorias desde Google Drive y configuración comercial.",
      onClick: () => navigate("enrichment"),
    },
    {
      id: "reviews",
      title: "Reseñas, Críticas y Oportunidades de Mejora",
      description:
        "Monitoreo del feedback de clientes post-servicio, métricas de satisfacción y planes de acción.",
      onClick: () => navigate("reviews"),
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {subView === "hub" && (
        <>
          <section className="panel p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <span className="eyebrow">Módulo del Sistema</span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Operaciones Comerciales y Marketing
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gestiona solicitudes de campañas promocionales, vinculación de fotografías desde Google Drive y seguimiento de evaluaciones de clientes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("new-campaign")}
              className="btn-primary h-10 px-5 shrink-0"
            >
              Nueva campaña
            </button>
          </section>

          <QuickAccessList items={quickAccessItems} />
        </>
      )}

      {subView === "new-campaign" && (
        <CampaignForm
          embedded
          onSave={handleSaveCampaign}
          onCancel={() => navigate("hub")}
        />
      )}

      {subView === "history" && (
        <section className="panel overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Registro de Solicitudes Comerciales ({campaigns.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                Estado de aprobación y vigencia de campañas enviadas a Jefatura
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("new-campaign")}
              className="btn-primary !min-h-[34px] !px-3.5 !text-xs"
            >
              Nueva campaña
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Campaña</th>
                  <th className="py-3 px-4">Descuento</th>
                  <th className="py-3 px-4">Precio Oferta</th>
                  <th className="py-3 px-4">Vigencia</th>
                  <th className="py-3 px-6 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-slate-900">{c.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                        {c.associatedItemNames?.join(" · ") || c.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-700 tabular-nums">
                      -{c.discountPercentage}%
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                      {formatPrice(c.promoPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 tabular-nums">
                      {c.validUntil}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span
                        className={`badge ${
                          STATUS_BADGE[c.status] ??
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                      No existen solicitudes de campaña registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {subView === "enrichment" && <OperationalCatalogEnricher embedded />}

      {subView === "reviews" && <ReviewsAnalyticsView embedded />}

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-4 max-w-md animate-slideUp text-xs"
        >
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

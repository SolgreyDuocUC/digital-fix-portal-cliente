import React, { useEffect, useMemo, useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { MarketingCampaign } from "@/types/commercial";
import { formatPrice } from "@/utils/currency";
import { resolveDriveImageUrl } from "@/utils/googleDrive";
import { QuickAccessList, QuickAccessItem } from "@/components/ui/QuickAccessList";
import { ReviewsAnalyticsView } from "../12-Reviews/ReviewsAnalyticsView";
import { ExecutiveSection } from "@/components/Layout/ExecutiveShell";

export type SalesHeadSubView = "hub" | "approvals" | "kpis" | "reports" | "reviews";
type ApprovalFilter = "ALL" | "PENDIENTE_APROBACION" | "APROBADA" | "RECHAZADA";

interface SalesHeadPortalViewProps {
  initialSubView?: SalesHeadSubView;
  embedded?: boolean;
  onNavigateSection?: (section: ExecutiveSection) => void;
}

const SUBVIEW_TO_SECTION: Record<SalesHeadSubView, ExecutiveSection> = {
  hub: "jefatura-hub",
  approvals: "jefatura-aprobaciones",
  kpis: "jefatura-reportes",
  reports: "jefatura-comunas",
  reviews: "mkt-resenas",
};

const STATUS_BADGE: Record<string, string> = {
  APROBADA: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  RECHAZADA: "bg-red-50 text-red-700 border border-red-200",
  PENDIENTE_APROBACION: "bg-amber-50 text-amber-700 border border-amber-200",
};

const STATUS_LABEL: Record<string, string> = {
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  PENDIENTE_APROBACION: "Pendiente",
};

export const SalesHeadPortalView: React.FC<SalesHeadPortalViewProps> = ({
  initialSubView = "hub",
  embedded = false,
  onNavigateSection,
}) => {
  const { campaigns, approveCampaign, rejectCampaign, kpis } = useCommercial();

  const [subView, setSubView] = useState<SalesHeadSubView>(initialSubView);
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("PENDIENTE_APROBACION");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [reviewingCampaign, setReviewingCampaign] = useState<MarketingCampaign | null>(null);
  const [rejectMode, setRejectMode] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);

  const navigate = (next: SalesHeadSubView) => {
    setSubView(next);
    if (!embedded) {
      onNavigateSection?.(SUBVIEW_TO_SECTION[next]);
    }
  };

  const counts = useMemo(() => {
    const pending = campaigns.filter((c) => c.status === "PENDIENTE_APROBACION").length;
    const approved = campaigns.filter((c) => c.status === "APROBADA").length;
    const rejected = campaigns.filter((c) => c.status === "RECHAZADA").length;
    return { all: campaigns.length, pending, approved, rejected };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (approvalFilter !== "ALL" && c.status !== approvalFilter) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.createdBy.toLowerCase().includes(q)
      );
    });
  }, [campaigns, approvalFilter, searchTerm]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const openReviewModal = (camp: MarketingCampaign) => {
    setReviewingCampaign(camp);
    setRejectMode(false);
    setRejectReason("");
    setModalError(null);
  };

  const closeReviewModal = () => {
    setReviewingCampaign(null);
    setRejectMode(false);
    setRejectReason("");
    setModalError(null);
  };

  const handleApprove = () => {
    if (!reviewingCampaign) return;
    approveCampaign(
      reviewingCampaign.id,
      "Aprobada por Jefatura. Cumple con margen comercial y cobertura."
    );
    showToast(`Campaña "${reviewingCampaign.title}" aprobada y publicada.`);
    closeReviewModal();
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingCampaign) return;
    if (!rejectReason.trim()) {
      setModalError("Indica el motivo o ajuste requerido para devolver la solicitud.");
      return;
    }
    rejectCampaign(reviewingCampaign.id, rejectReason.trim());
    showToast(`Campaña "${reviewingCampaign.title}" devuelta con observaciones.`);
    closeReviewModal();
  };

  const quickAccessItems: QuickAccessItem[] = [
    {
      id: "approvals",
      title: `Aprobación de Promociones (${counts.pending} pendientes)`,
      description: "Revisión de márgenes, vigencia e ítems de campañas enviadas por Marketing.",
      onClick: () => navigate("approvals"),
    },
    {
      id: "kpis",
      title: "KPIs Operativos y Comerciales",
      description: `Ventas mensuales (${formatPrice(kpis.totalSalesMonth)}), tasa de conversión (${kpis.conversionRate}%) y rendimiento por asesor.`,
      onClick: () => navigate("kpis"),
    },
    {
      id: "reports",
      title: "Informes de Demanda por Comuna",
      description: "Distribución de órdenes, tickets promedio y cobertura de cuadrillas SEC.",
      onClick: () => navigate("reports"),
    },
    {
      id: "reviews",
      title: "Reseñas y Oportunidades de Mejora",
      description: "Auditoría de satisfacción post-servicio y seguimiento de planes correctivos.",
      onClick: () => navigate("reviews"),
    },
  ];

  const containerClass = embedded
    ? "w-full space-y-6 animate-fadeIn"
    : "w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn";

  return (
    <div className={containerClass}>
      {/* HUB PRINCIPAL */}
      {subView === "hub" && !embedded && (
        <>
          <section className="panel p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <span className="eyebrow">Módulo del Sistema</span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Jefatura de Ventas y Operaciones
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Supervisa la publicación de promociones comerciales, conversión de cotizaciones y rendimiento operativo por comuna.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("approvals")}
              className="btn-primary h-10 px-5 shrink-0"
            >
              Revisar aprobaciones
            </button>
          </section>

          <QuickAccessList items={quickAccessItems} />
        </>
      )}

      {/* SUB-VISTA 1: APROBACIÓN DE PROMOCIONES (TABLA + MODAL) */}
      {subView === "approvals" && (
        <div className="space-y-6">
          <header className="page-head mb-0">
            <div>
              <span className="eyebrow">Control Comercial</span>
              <h1 className="mt-1">Aprobación de Promociones</h1>
              <p>
                Revisión de solicitudes enviadas por Marketing antes de su publicación en tienda.
              </p>
            </div>
          </header>

          <section className="panel overflow-hidden">
            <div
              role="tablist"
              aria-label="Filtrar solicitudes de campaña"
              className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-2 border-b border-slate-100"
            >
              {(
                [
                  { id: "PENDIENTE_APROBACION", label: "Pendientes", count: counts.pending },
                  { id: "APROBADA", label: "Aprobadas", count: counts.approved },
                  { id: "RECHAZADA", label: "Rechazadas", count: counts.rejected },
                  { id: "ALL", label: "Todas", count: counts.all },
                ] as const
              ).map((tab) => {
                const active = approvalFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setApprovalFilter(tab.id)}
                    className={`inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[11px] tabular-nums ${
                        active ? "bg-brand-700 text-brand-50" : "bg-white text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200">
              <div className="search-group max-w-md !bg-white">
                <input
                  type="search"
                  placeholder="Buscar por código, título o responsable..."
                  aria-label="Buscar promociones"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="px-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Código</th>
                    <th className="py-3 px-4">Campaña</th>
                    <th className="py-3 px-4 text-right">Descuento</th>
                    <th className="py-3 px-4 text-right">Precio Oferta</th>
                    <th className="py-3 px-4">Vigencia</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {filteredCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                        {camp.id}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{camp.title}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {camp.createdBy}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-brand-700 tabular-nums whitespace-nowrap">
                        -{camp.discountPercentage}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatPrice(camp.promoPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {camp.validUntil}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`badge ${
                            STATUS_BADGE[camp.status] ??
                            "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {STATUS_LABEL[camp.status] ?? camp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openReviewModal(camp)}
                          className="btn-secondary !min-h-[32px] !px-3 !text-xs"
                        >
                          {camp.status === "PENDIENTE_APROBACION" ? "Revisar" : "Ver detalle"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                        No hay campañas registradas en este estado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* SUB-VISTA 2: KPIs OPERATIVOS Y COMERCIALES */}
      {subView === "kpis" && (
        <div className="space-y-6">
          <header className="page-head mb-0">
            <div>
              <span className="eyebrow">Desempeño Comercial</span>
              <h1 className="mt-1">KPIs Operativos y Comerciales</h1>
              <p>Indicadores de ventas cerradas, conversión y cumplimiento de cuadrillas.</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-secondary"
            >
              Imprimir reporte
            </button>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="panel p-5 space-y-1">
              <span className="eyebrow">Ventas del Mes</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatPrice(kpis.totalSalesMonth)}
              </div>
              <p className="text-xs text-emerald-700 font-medium tabular-nums">
                +18,4% vs mes anterior
              </p>
            </div>

            <div className="panel p-5 space-y-1">
              <span className="eyebrow">Conversión Cotizaciones</span>
              <div className="text-2xl font-bold text-brand-700 tabular-nums">
                {kpis.conversionRate}%
              </div>
              <p className="text-xs text-slate-500 tabular-nums">
                {kpis.approvedQuotes} aprobadas de {kpis.totalQuotes}
              </p>
            </div>

            <div className="panel p-5 space-y-1">
              <span className="eyebrow">Cumplimiento SLA</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {kpis.slaCompliancePercent}%
              </div>
              <p className="text-xs text-slate-500 tabular-nums">Llegada menor a 2 hrs</p>
            </div>

            <div className="panel p-5 space-y-1">
              <span className="eyebrow">Campañas Activas</span>
              <div className="text-2xl font-bold text-brand-700 tabular-nums">
                {kpis.activeCampaigns}
              </div>
              <p className="text-xs text-slate-500">Visibles en tienda</p>
            </div>
          </div>

          <section className="panel overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">
                Rendimiento por Asesor Comercial
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-6">Asesor Comercial</th>
                    <th className="py-3 px-4 text-center">Cotizaciones</th>
                    <th className="py-3 px-4 text-center">Aprobadas</th>
                    <th className="py-3 px-4 text-center">Conversión</th>
                    <th className="py-3 px-6 text-right">Ventas Cerradas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {kpis.sellerPerformances.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{s.sellerName}</td>
                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-700">
                        {s.quotesCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-700 tabular-nums">
                        {s.approvedCount}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="badge bg-brand-50 text-brand-700 border border-brand-200 tabular-nums">
                          {s.conversion}%
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-slate-900 tabular-nums">
                        {formatPrice(s.salesTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* SUB-VISTA 3: INFORMES POR COMUNA */}
      {subView === "reports" && (
        <div className="space-y-6">
          <header className="page-head mb-0">
            <div>
              <span className="eyebrow">Análisis Territorial</span>
              <h1 className="mt-1">Demanda y Ventas por Comuna</h1>
              <p>Distribución de órdenes aprobadas y volumen de ventas por zona.</p>
            </div>
          </header>

          <section className="panel p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3.5">
                {kpis.topCommunes.map((tc, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span className="tabular-nums">
                        {idx + 1}. {tc.commune}
                      </span>
                      <span className="tabular-nums text-slate-600">
                        {tc.ordersCount} órdenes · {formatPrice(tc.totalSales)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md bg-brand-600"
                        style={{ width: `${Math.min(100, (tc.ordersCount / 24) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2.5">
                <h3 className="text-sm font-bold text-slate-900">Resumen Operativo</h3>
                <p>
                  <strong className="text-slate-800">Maipú</strong> concentra la mayor demanda en mantención preventiva de tableros TDA y reposición de diferenciales.
                </p>
                <p>
                  <strong className="text-slate-800">Las Condes y Providencia</strong> lideran en certificación TE1 y mantenimiento de grupos electrógenos con ticket promedio superior.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SUB-VISTA 4: RESEÑAS */}
      {subView === "reviews" && <ReviewsAnalyticsView embedded />}

      {/* MODAL DE REVISIÓN / APROBACIÓN DE CAMPAÑA */}
      {reviewingCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="camp-review-title"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="eyebrow tabular-nums">{reviewingCampaign.id}</span>
                <h2 id="camp-review-title" className="text-base font-bold text-slate-900 truncate">
                  {reviewingCampaign.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeReviewModal}
                className="btn-ghost !min-h-[32px] !px-2.5 !text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={resolveDriveImageUrl(reviewingCampaign.referencePhotoUrl)}
                  alt={reviewingCampaign.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {reviewingCampaign.description}
              </p>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="block text-slate-500">Precio lista</span>
                  <span className="line-through text-slate-500 tabular-nums">
                    {formatPrice(reviewingCampaign.regularPrice)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Precio oferta</span>
                  <span className="font-bold text-brand-700 tabular-nums">
                    {formatPrice(reviewingCampaign.promoPrice)} (-{reviewingCampaign.discountPercentage}%)
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Vigencia</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {reviewingCampaign.validUntil}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Ítems: </span>
                {reviewingCampaign.associatedItemNames.join(" · ")}
              </div>

              {reviewingCampaign.status === "PENDIENTE_APROBACION" && !rejectMode && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectMode(true)}
                    className="btn-secondary text-red-700 hover:bg-red-50 border-red-200"
                  >
                    Solicitar ajustes
                  </button>
                  <button type="button" onClick={handleApprove} className="btn-primary px-5">
                    Aprobar y publicar
                  </button>
                </div>
              )}

              {rejectMode && (
                <form onSubmit={handleRejectSubmit} className="pt-3 border-t border-slate-100 space-y-3">
                  {modalError && (
                    <div
                      role="alert"
                      className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
                    >
                      {modalError}
                    </div>
                  )}
                  <div>
                    <label className="label" htmlFor="reject-reason">
                      Observaciones para Marketing *
                    </label>
                    <textarea
                      id="reject-reason"
                      rows={3}
                      placeholder="Indica el ajuste comercial o técnico requerido..."
                      value={rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        setModalError(null);
                      }}
                      className="w-full p-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 outline-none focus:border-brand-600 focus:ring-3 focus:ring-brand-200/70"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectMode(false)}
                      className="btn-secondary"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="btn-primary !bg-red-600 hover:!bg-red-700"
                    >
                      Confirmar rechazo
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

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

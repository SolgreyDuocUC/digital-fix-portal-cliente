import React, { useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { formatPrice } from "@/utils/currency";
import { resolveDriveImageUrl } from "@/utils/googleDrive";
import { ReviewsAnalyticsView } from "../12-Reviews/ReviewsAnalyticsView";

export const SalesHeadPortalView: React.FC = () => {
  const { campaigns, approveCampaign, rejectCampaign, kpis } = useCommercial();

  const [activeTab, setActiveTab] = useState<"approvals" | "kpis" | "reports" | "reviews">("approvals");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectingCampaignId, setRejectingCampaignId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingCampaigns = campaigns.filter((c) => c.status === "PENDIENTE_APROBACION");
  const approvedCampaigns = campaigns.filter((c) => c.status === "APROBADA");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleApprove = (id: string, title: string) => {
    approveCampaign(id, "Aprobada por Jefatura. Cumple con margen comercial y cobertura.");
    showToast(`¡Campaña "${title}" aprobada y publicada en el portal cliente!`);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCampaignId || !rejectReason.trim()) return;
    rejectCampaign(rejectingCampaignId, rejectReason.trim());
    showToast(`Campaña rechazada. Se devolvió observación al asistente comercial.`);
    setRejectingCampaignId(null);
    setRejectReason("");
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Encabezado Jefatura */}
      <div className="pb-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-brand-600 text-xs font-semibold border border-slate-200">
              Rol: Jefe de Ventas y Operaciones
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Aprobación de Promociones, KPIs & Reportería
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Controla la publicación de promociones de marketing en la web, supervisa la conversión de cotizaciones a órdenes operativas y analiza el rendimiento comercial por comuna y cuadrilla.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              Imprimir Reporte Gerencial
            </button>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación de Jefatura */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 ${
            activeTab === "approvals"
              ? "bg-brand-700 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Aprobación de Promociones
          {pendingCampaigns.length > 0 && (
            <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
              {pendingCampaigns.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("kpis")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 ${
            activeTab === "kpis"
              ? "bg-brand-700 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          KPIs Operativos & Comerciales
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 ${
            activeTab === "reports"
              ? "bg-brand-700 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Informes de Negocios por Comuna
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 ${
            activeTab === "reviews"
              ? "bg-brand-700 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Reseñas & Oportunidades de Mejora
        </button>
      </div>

      {/* VISTA 1: Aprobación de Promociones de Marketing */}
      {activeTab === "approvals" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Solicitudes de Promociones Pendientes de Revisión ({pendingCampaigns.length})
            </h2>
            <span className="text-xs text-slate-500">
              Las promociones aprobadas se publican en el banner principal de clientes.
            </span>
          </div>

          {pendingCampaigns.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center text-slate-500 space-y-2">
              <p className="font-semibold text-slate-800">
                ¡Todas las promociones comerciales están al día!
              </p>
              <p className="text-xs">
                No hay solicitudes pendientes enviadas por el Asistente de Operaciones Comerciales.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white rounded-2xl border border-amber-200/90 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[16/9] bg-slate-100">
                    <img
                      src={resolveDriveImageUrl(camp.referencePhotoUrl)}
                      alt={camp.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-brand-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
                      {camp.discountPercentage}% OFF
                    </span>
                    <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      Vence: {camp.validUntil}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Creado por: <strong>{camp.createdBy}</strong></span>
                        <span className="font-mono text-amber-700 font-bold">{camp.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{camp.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{camp.description}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Precio Regular Estimado:</span>
                        <span className="line-through text-slate-400">{formatPrice(camp.regularPrice)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Precio Promoción Solicitado:</span>
                        <span className="text-emerald-700 text-sm font-bold">{formatPrice(camp.promoPrice)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1">
                        <strong>Ítems incluidos:</strong> {camp.associatedItemNames.join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setRejectingCampaignId(camp.id)}
                        className="flex-1 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 font-semibold text-xs rounded-lg transition cursor-pointer"
                      >
                        Desaprobar / Ajustes
                      </button>
                      <button
                        onClick={() => handleApprove(camp.id, camp.title)}
                        className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        Aprobar y Publicar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Promociones Activas en el Portal */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">
              Promociones Aprobadas y Publicadas en el Portal Cliente ({approvedCampaigns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs flex items-center gap-4"
                >
                  <img
                    src={resolveDriveImageUrl(camp.referencePhotoUrl)}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      PUBLICADA EN WEB
                    </span>
                    <h4 className="font-bold text-slate-900 truncate mt-1">{camp.title}</h4>
                    <p className="text-emerald-700 font-bold text-sm">{formatPrice(camp.promoPrice)}</p>
                    <p className="text-[10px] text-slate-500">
                      Vigencia: hasta {camp.validUntil} · Aprobó: {camp.reviewedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: Dashboard de KPIs Operativos y Comerciales */}
      {activeTab === "kpis" && (
        <div className="space-y-6">
          {/* Tarjetas de Métricas Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Ventas del Mes (CLP)
              </span>
              <div className="text-2xl font-bold text-slate-900">
                {formatPrice(kpis.totalSalesMonth)}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                +18,4 % vs mes anterior
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Conversión de Cotizaciones
              </span>
              <div className="text-2xl font-bold text-blue-700">
                {kpis.conversionRate}%
              </div>
              <p className="text-[11px] text-slate-500">
                {kpis.approvedQuotes} aprobadas de {kpis.totalQuotes} emitidas
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Cumplimiento SLA Cuadrillas
              </span>
              <div className="text-2xl font-bold text-slate-900">
                {kpis.slaCompliancePercent}%
              </div>
              <p className="text-[11px] text-slate-500">
                Llegada &lt; 2 hrs en terreno
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Campañas Activas en Tienda
              </span>
              <div className="text-2xl font-bold text-purple-700">
                {kpis.activeCampaigns}
              </div>
              <p className="text-[11px] text-slate-500">
                Promociones visibles al público
              </p>
            </div>
          </div>

          {/* Rendimiento por Asesor / Vendedor */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Rendimiento de Vendedores y Asesores Comerciales en Terreno
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Asesor Comercial</th>
                    <th className="py-2.5 px-3 text-center">Cotizaciones Emitidas</th>
                    <th className="py-2.5 px-3 text-center">Cotizaciones Aprobadas</th>
                    <th className="py-2.5 px-3 text-center">Tasa de Conversión</th>
                    <th className="py-2.5 px-3 text-right">Ventas Totales Cerradas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kpis.sellerPerformances.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-semibold text-slate-900">{s.sellerName}</td>
                      <td className="py-3 px-3 text-center">{s.quotesCount}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">{s.approvedCount}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                          {s.conversion}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatPrice(s.salesTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: Informes de Negocios por Comuna */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Distribución de Demanda y Ventas por Comuna
              </h3>
              <p className="text-xs text-slate-500">
                Comunas con mayor volumen de órdenes y cotizaciones aprobadas para cuadrillas SEC.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full">
              Zona Poniente (Maipú) Liderando
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {kpis.topCommunes.map((tc, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {tc.commune}
                    </span>
                    <span>{tc.ordersCount} órdenes · {formatPrice(tc.totalSales)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? "bg-emerald-600" : "bg-blue-600"
                      }`}
                      style={{ width: `${(tc.ordersCount / 24) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                Conclusiones Operativas de la Jefatura
              </h4>
              <p>
                <strong>Maipú</strong> concentra la mayor demanda en <em>Mantención Preventiva de Tableros TDA</em> y reposición de diferenciales por sobrecargas residenciales y comerciales.
              </p>
              <p>
                <strong>Las Condes y Providencia</strong> presentan alta tasa de contratación para <em>Certificación TE1 y Mantenimiento de Grupos Electrógenos</em> con ticket promedio superior.
              </p>
              <p>
                Se recomienda mantener el refuerzo de cuadrillas en la base Maipú con disponibilidad de 4 vehículos de intervención rápida.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 4: Reseñas & Oportunidades de Mejora */}
      {activeTab === "reviews" && <ReviewsAnalyticsView />}

      {/* Modal para Desaprobar / Solicitar Ajustes */}
      {rejectingCampaignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Desaprobar / Solicitar Ajuste de Campaña
            </h3>
            <p className="text-xs text-slate-500">
              Escribe las observaciones técnicas o comerciales para que el Asistente de Operaciones ajuste la campaña.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                placeholder="Ej: El descuento del 30% supera el umbral permitido para este servicio. Ajustar a 20% o validar stock de repuestos."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                className="w-full p-3 rounded-lg border border-slate-300 text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingCampaignId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 max-w-md animate-slideUp text-xs">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="shrink-0 h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};


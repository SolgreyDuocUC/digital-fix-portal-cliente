import React, { useMemo, useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { ServiceReview, ReviewCategory } from "@/types/commercial";

interface ReviewsAnalyticsViewProps {
  embedded?: boolean;
}

const CATEGORY_BADGE: Record<ReviewCategory, string> = {
  FELICITACION: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  MEJORA: "bg-amber-50 text-amber-700 border border-amber-200",
  CRITICA: "bg-red-50 text-red-700 border border-red-200",
};

const CATEGORY_LABEL: Record<ReviewCategory, string> = {
  FELICITACION: "Felicitación",
  MEJORA: "Mejora",
  CRITICA: "Crítica",
};

export const ReviewsAnalyticsView: React.FC<ReviewsAnalyticsViewProps> = ({
  embedded = false,
}) => {
  const { reviews } = useCommercial();

  const [activeTab, setActiveTab] = useState<"ALL" | ReviewCategory>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedReviewForAction, setSelectedReviewForAction] = useState<ServiceReview | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stats = useMemo(() => {
    const avg = (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1);
    return {
      avg,
      total: reviews.length,
      felicitaciones: reviews.filter((r) => r.category === "FELICITACION").length,
      mejoras: reviews.filter((r) => r.category === "MEJORA").length,
      criticas: reviews.filter((r) => r.category === "CRITICA").length,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return reviews.filter((r) => {
      if (activeTab !== "ALL" && r.category !== activeTab) return false;
      if (!q) return true;
      return (
        r.clientName.toLowerCase().includes(q) ||
        r.targetName.toLowerCase().includes(q) ||
        r.clientCommune.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
      );
    });
  }, [reviews, activeTab, searchTerm]);

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForAction || !actionNotes.trim()) return;
    selectedReviewForAction.actionTaken = actionNotes.trim();
    setToastMessage(`Acción registrada para ${selectedReviewForAction.targetName}.`);
    setSelectedReviewForAction(null);
    setActionNotes("");
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className={embedded ? "space-y-6 animate-fadeIn" : "max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn"}>
      <header className="page-head mb-0">
        <div>
          <span className="eyebrow">Calidad y Feedback</span>
          <h1 className="mt-1">Evaluaciones de Clientes</h1>
          <p>
            Monitoreo de calificaciones post-servicio y registro de acciones correctivas.
          </p>
        </div>

        <div className="panel px-5 py-3 text-right shrink-0">
          <span className="eyebrow block">Satisfacción Media</span>
          <div className="text-2xl font-bold text-brand-700 tabular-nums mt-0.5">
            {stats.avg} <span className="text-sm font-semibold text-slate-500">/ 5</span>
          </div>
          <span className="text-[11px] text-slate-500 tabular-nums">
            {stats.total} opiniones verificadas
          </span>
        </div>
      </header>

      {/* Métricas ejecutivas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="panel p-5 space-y-1">
          <span className="eyebrow">Felicitaciones</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {stats.felicitaciones}
          </div>
          <p className="text-xs text-slate-500">Reconocimientos a puntualidad y servicio</p>
        </div>

        <div className="panel p-5 space-y-1">
          <span className="eyebrow">Oportunidades de Mejora</span>
          <div className="text-2xl font-bold text-brand-700 tabular-nums">
            {stats.mejoras}
          </div>
          <p className="text-xs text-slate-500">Sugerencias para tiempos y atención</p>
        </div>

        <div className="panel p-5 space-y-1">
          <span className="eyebrow">Críticas y Reclamos</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {stats.criticas}
          </div>
          <p className="text-xs text-slate-500">Eventos sujetos a plan correctivo</p>
        </div>
      </div>

      {/* Tabla operativa con filtros */}
      <section className="panel overflow-hidden">
        <div
          role="tablist"
          aria-label="Filtrar evaluaciones"
          className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-2 border-b border-slate-100"
        >
          {(
            [
              { id: "ALL", label: "Todas", count: stats.total },
              { id: "FELICITACION", label: "Felicitaciones", count: stats.felicitaciones },
              { id: "MEJORA", label: "Mejoras", count: stats.mejoras },
              { id: "CRITICA", label: "Críticas", count: stats.criticas },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
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
              placeholder="Buscar por cliente, comuna, ítem o comentario..."
              aria-label="Buscar evaluaciones"
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
                <th className="py-3 px-5">Cliente / Comuna</th>
                <th className="py-3 px-4">Ítem y Comentario</th>
                <th className="py-3 px-4 text-center">Nota</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-5 text-right">Plan de Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {filteredReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors align-top">
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <p className="font-semibold text-slate-900">{rev.clientName}</p>
                    <p className="text-xs text-slate-500">{rev.clientCommune}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <p className="text-xs font-semibold text-brand-700">{rev.targetName}</p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{rev.comment}</p>
                    {rev.actionTaken && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1.5">
                        Acción: {rev.actionTaken}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    {rev.rating} / 5
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`badge ${CATEGORY_BADGE[rev.category]}`}>
                      {CATEGORY_LABEL[rev.category]}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReviewForAction(rev);
                        setActionNotes(rev.actionTaken || "");
                      }}
                      className="btn-secondary !min-h-[32px] !px-3 !text-xs"
                    >
                      {rev.actionTaken ? "Editar acción" : "Registrar acción"}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                    No existen evaluaciones para el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal para registrar acción correctiva */}
      {selectedReviewForAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-action-title"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <h2 id="review-action-title" className="text-base font-bold text-slate-900">
                Registrar Acción Correctiva
              </h2>
              <button
                type="button"
                onClick={() => setSelectedReviewForAction(null)}
                className="btn-ghost !min-h-[32px] !px-2.5 !text-xs"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveAction} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <p className="font-semibold text-slate-900">
                  {selectedReviewForAction.clientName} · {selectedReviewForAction.targetName}
                </p>
                <p className="text-slate-600">{selectedReviewForAction.comment}</p>
              </div>

              <div>
                <label className="label" htmlFor="action-notes">
                  Medida correctiva o de mejora *
                </label>
                <textarea
                  id="action-notes"
                  rows={3}
                  placeholder="Describa la medida adoptada con el equipo operativo o comercial..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 outline-none transition-all hover:border-slate-400 focus:border-brand-600 focus:ring-3 focus:ring-brand-200/70"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReviewForAction(null)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar acción
                </button>
              </div>
            </form>
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

import React, { useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { ServiceReview, ReviewCategory } from "@/types/commercial";

export const ReviewsAnalyticsView: React.FC = () => {
  const { reviews } = useCommercial();

  const [activeTab, setActiveTab] = useState<"ALL" | ReviewCategory>("ALL");
  const [selectedReviewForAction, setSelectedReviewForAction] = useState<ServiceReview | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === "ALL") return true;
    return r.category === activeTab;
  });

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1);
  const totalFelicitaciones = reviews.filter((r) => r.category === "FELICITACION").length;
  const totalMejoras = reviews.filter((r) => r.category === "MEJORA").length;
  const totalCriticas = reviews.filter((r) => r.category === "CRITICA").length;

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForAction) return;
    selectedReviewForAction.actionTaken = actionNotes;
    setToastMessage(`Oportunidad de mejora registrada para ${selectedReviewForAction.targetName}.`);
    setSelectedReviewForAction(null);
    setActionNotes("");
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Cabecera */}
      <div className="pb-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest block">
              Auditoría de Calidad ISO 25010 & Feedback de Clientes
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Reseñas, Oportunidades de Mejora & Críticas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Panel conjunto para el Asistente Comercial y el Jefe de Ventas y Operaciones. Monitorea la percepción del cliente final, analiza críticas operativas de cuadrillas y registra planes de acción correctivos.
            </p>
          </div>
          <div className="bg-white  px-5 py-3 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">Satisfacción Media</span>
            <div className="text-3xl font-bold text-brand-600 flex items-center justify-center gap-1 mt-0.5">
              <span>{avgRating}</span>
              <span className="text-base font-semibold text-slate-600">/ 5</span>
            </div>
            <span className="text-[11px] text-slate-600">{reviews.length} opiniones verificadas</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas de Opiniones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Felicitaciones de Clientes
          </span>
          <div className="text-2xl font-bold text-slate-900">
            {totalFelicitaciones} casos
          </div>
          <p className="text-[11px] text-slate-500">
            Reconocimientos a puntualidad y pericia técnica SEC.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Oportunidades de Mejora
          </span>
          <div className="text-2xl font-bold text-blue-700">
            {totalMejoras} detectadas
          </div>
          <p className="text-[11px] text-slate-500">
            Sugerencias de clientes para optimizar tiempos y canales.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Críticas y Reclamos Abordados
          </span>
          <div className="text-2xl font-bold text-red-700">
            {totalCriticas} eventos
          </div>
          <p className="text-[11px] text-slate-500">
            Planes de acción correctiva aplicados con jefatura.
          </p>
        </div>
      </div>

      {/* Pestañas de Filtro */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer ${
            activeTab === "ALL" ? "bg-brand-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Todas ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("FELICITACION")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer ${
            activeTab === "FELICITACION" ? "bg-brand-700 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Felicitaciones ({totalFelicitaciones})
        </button>
        <button
          onClick={() => setActiveTab("MEJORA")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer ${
            activeTab === "MEJORA" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Oportunidades de Mejora ({totalMejoras})
        </button>
        <button
          onClick={() => setActiveTab("CRITICA")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer ${
            activeTab === "CRITICA" ? "bg-red-700 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Críticas y Reclamos ({totalCriticas})
        </button>
      </div>

      {/* Listado de Reseñas */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{rev.clientName}</span>
                  <span className="text-slate-400 text-xs">({rev.clientCommune})</span>
                  {rev.verifiedPurchase && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      Cliente verificado
                    </span>
                  )}
                </div>
                <div className="text-xs text-blue-700 font-semibold mt-0.5">
                  Ítem evaluado: {rev.targetName}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-amber-500 font-bold text-sm tracking-wide">
                  {rev.rating} / 5
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  rev.category === "FELICITACION"
                    ? "bg-emerald-100 text-emerald-800"
                    : rev.category === "MEJORA"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {rev.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{rev.comment}"
            </p>

            {/* Acción de Mejora registrada si existe */}
            {rev.actionTaken ? (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                  Plan de Acción / Oportunidad de Mejora Adoptada:
                </p>
                <p className="text-[11px] text-emerald-700">{rev.actionTaken}</p>
              </div>
            ) : (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedReviewForAction(rev)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Registrar Acción Correctiva o de Mejora
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal para Registrar Acción Correctiva */}
      {selectedReviewForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Registrar Acción de Mejora Operativa
            </h3>
            <p className="text-xs text-slate-500">
              Caso de cliente: <strong>{selectedReviewForAction.clientName}</strong> sobre <strong>{selectedReviewForAction.targetName}</strong>.
            </p>
            <form onSubmit={handleSaveAction} className="space-y-4">
              <textarea
                rows={3}
                placeholder="Describa la medida correctiva (ej: Reasignación de cuadrillas con GPS, capacitación de instaladores SEC, revisión de stock en bodega)..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-slate-300 text-xs"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedReviewForAction(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Guardar Plan de Acción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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


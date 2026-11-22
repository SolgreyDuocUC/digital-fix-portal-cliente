import React, { useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { CommercialQuote } from "@/types/commercial";
import { formatPrice } from "@/utils/currency";
import { QuotePrintModal } from "./QuotePrintModal";

interface QuotesListViewProps {
  onCreateNew: () => void;
}

type TabType = "borrador" | "pendiente" | "aprobadas" | "historial";

export const QuotesListView: React.FC<QuotesListViewProps> = ({ onCreateNew }) => {
  const {
    quotes,
    approveQuoteAndConvertToOrder,
    rejectQuote,
    sendQuoteEmail,
  } = useCommercial();

  const [activeTab, setActiveTab] = useState<TabType>("historial");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [selectedQuoteToPrint, setSelectedQuoteToPrint] = useState<CommercialQuote | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 6000);
  };

  // Filtrado por pestaña
  const filteredByTab = quotes.filter((q) => {
    if (activeTab === "borrador") return q.status === "BORRADOR";
    if (activeTab === "pendiente") return q.status === "PENDIENTE_APROBACION";
    if (activeTab === "aprobadas") return q.status === "APROBADA_POR_CLIENTE";
    return true; // Historial
  });

  // Búsqueda en vivo
  const searchLower = searchTerm.toLowerCase();
  const searchFiltered = filteredByTab.filter(
    (q) =>
      q.id.toLowerCase().includes(searchLower) ||
      q.clientName.toLowerCase().includes(searchLower) ||
      q.jobTitle?.toLowerCase().includes(searchLower) ||
      q.sellerName.toLowerCase().includes(searchLower)
  );

  // Ordenamiento
  const sortedQuotes = [...searchFiltered].sort((a, b) => {
    if (sortOrder === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const handleApprove = (quoteId: string) => {
    const orderCreated = approveQuoteAndConvertToOrder(quoteId);
    if (orderCreated) {
      showToast(
        `¡Cotización aprobada por cliente! Orden de Trabajo ${orderCreated.id} generada y enviada al panel operativo.`
      );
    }
  };

  const handleReject = (quoteId: string) => {
    const reason = prompt("Ingresa el motivo de cancelación:");
    if (reason !== null) {
      rejectQuote(quoteId, reason || "Desestimada por cliente");
      showToast(`Cotización ${quoteId} cancelada.`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Cabecera Principal (Inspirada en Imagen 2) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Solicitudes de Cotización
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Solicitud de cotizaciones y costeo técnico interno hacia operaciones.
          </p>
        </div>

        <div>
          <button
            onClick={onCreateNew}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
          >
            Crear Solicitud
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación con Subrayado Azul (Inspirado en Imagen 2) */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("borrador")}
          className={`pb-3 transition relative cursor-pointer ${
            activeTab === "borrador"
              ? "text-blue-600 font-bold border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Borrador
          <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {quotes.filter((q) => q.status === "BORRADOR").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pendiente")}
          className={`pb-3 transition relative cursor-pointer ${
            activeTab === "pendiente"
              ? "text-blue-600 font-bold border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Pendiente Aprobación (Cliente)
          <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
            {quotes.filter((q) => q.status === "PENDIENTE_APROBACION").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("aprobadas")}
          className={`pb-3 transition relative cursor-pointer ${
            activeTab === "aprobadas"
              ? "text-blue-600 font-bold border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Aprobadas (Enviadas a Operación)
          <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
            {quotes.filter((q) => q.status === "APROBADA_POR_CLIENTE").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("historial")}
          className={`pb-3 transition relative cursor-pointer ${
            activeTab === "historial"
              ? "text-blue-600 font-bold border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Historial
          <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
            {quotes.length}
          </span>
        </button>
      </div>

      {/* Barra de Filtros (Buscador + Rango Fechas + Ordenación) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            placeholder="Buscar cliente, ID o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Datepicker Rango */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="dd/mm/aaaa - dd/mm/aaaa"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 px-3 pl-8 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 w-48"
            />
          </div>

          {/* Ordenación */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "recent" | "oldest")}
            className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 font-semibold"
          >
            <option value="recent">Fecha: Reciente a antigua</option>
            <option value="oldest">Fecha: Antigua a reciente</option>
          </select>
        </div>
      </div>

      {/* Tabla de Solicitudes (Diseño idéntico a Imagen 2) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Solicitud</th>
                <th className="py-3.5 px-3">Estado</th>
                <th className="py-3.5 px-3">Creación</th>
                <th className="py-3.5 px-2 text-center">Sync</th>
                <th className="py-3.5 px-4">Producto / Servicio</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Vendedor</th>
                <th className="py-3.5 px-3">Fecha</th>
                <th className="py-3.5 px-3">Emisión</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No se encontraron solicitudes para los filtros aplicados.
                  </td>
                </tr>
              ) : (
                sortedQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {q.id}
                    </td>

                    {/* ESTADO */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        q.status === "BORRADOR"
                          ? "bg-amber-100 text-amber-800"
                          : q.status === "PENDIENTE_APROBACION"
                          ? "bg-blue-100 text-blue-800"
                          : q.status === "APROBADA_POR_CLIENTE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {q.status === "BORRADOR"
                          ? "Borrador"
                          : q.status === "PENDIENTE_APROBACION"
                          ? "Pendiente"
                          : q.status === "APROBADA_POR_CLIENTE"
                          ? "Aprobada"
                          : "Cancelada"}
                      </span>
                    </td>

                    {/* CREACIÓN */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded border border-slate-200 text-[10px] text-slate-600 bg-slate-50">
                        Original
                      </span>
                    </td>

                    {/* SYNC */}
                    <td className="py-3.5 px-2 text-center">
                      <span
                        title="Sincronizado con microservicio operativo"
                        className="text-[11px] font-semibold text-emerald-700"
                      >
                        Sincronizada
                      </span>
                    </td>

                    {/* PRODUCTO / SERVICIO */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="font-semibold text-slate-900">{q.jobTitle || q.items[0]?.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{q.serviceTypeTemplate}</div>
                    </td>

                    {/* CLIENTE */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 min-w-[160px]">
                      {q.clientName}
                    </td>

                    {/* VENDEDOR */}
                    <td className="py-3.5 px-4 text-slate-600 min-w-[140px]">
                      {q.sellerName}
                    </td>

                    {/* FECHA */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {q.createdAt.split("T")[0]}
                    </td>

                    {/* EMISIÓN (TOTAL) */}
                    <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {formatPrice(q.total)}
                    </td>

                    {/* ACCIONES */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedQuoteToPrint(q)}
                          title="Imprimir / Guardar PDF"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        >
                        </button>

                        {q.status === "PENDIENTE_APROBACION" && (
                          <button
                            onClick={() => handleApprove(q.id)}
                            title="Aprobar por Cliente (Generar Orden a Operaciones)"
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                          >
                          </button>
                        )}

                        <button
                          onClick={() => handleReject(q.id)}
                          title="Eliminar / Desestimar"
                          className="h-8 px-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Desestimar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Impresión */}
      <QuotePrintModal
        quote={selectedQuoteToPrint}
        isOpen={!!selectedQuoteToPrint}
        onClose={() => setSelectedQuoteToPrint(null)}
      />

      {/* Toast */}
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


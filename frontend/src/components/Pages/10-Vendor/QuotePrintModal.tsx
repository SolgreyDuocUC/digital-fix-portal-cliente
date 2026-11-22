import React from "react";
import { CommercialQuote } from "@/types/commercial";
import { formatPrice } from "@/utils/currency";
import { Brand } from "@/components/ui/Brand";

interface QuotePrintModalProps {
  quote: CommercialQuote | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuotePrintModal: React.FC<QuotePrintModalProps> = ({
  quote,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !quote) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 animate-slideUp my-6 border border-slate-200 print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Barra superior de acciones (oculta al imprimir) */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Cotización Formal SEC
            </span>
            <span className="text-xs text-slate-500">
              Vigencia: 15 días corridos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* CONTENIDO MEMBRETADO PARA IMPRESIÓN */}
        <div className="pt-6 space-y-6 text-slate-800">
          {/* Encabezado membretado */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Brand />
              <p className="text-xs text-slate-500 mt-1">
                Servicios y Soluciones Eléctricas Homologadas SEC
              </p>
              <p className="text-xs text-slate-500">
                RUT: 76.982.110-K · Fono Central: +56 9 8765 4321
              </p>
              <p className="text-xs text-slate-500">
                Casa Matriz: Santiago, Chile
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-900">
                COTIZACIÓN COMERCIAL
              </h2>
              <p className="text-sm font-semibold text-blue-600">
                N° {quote.id}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Fecha emisión: {new Date(quote.createdAt).toLocaleDateString("es-CL")}
              </p>
              <p className="text-xs text-slate-500">
                Válida hasta: {new Date(quote.expiresAt).toLocaleDateString("es-CL")}
              </p>
            </div>
          </div>

          {/* Bloque de datos Cliente y Asesor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-900 uppercase tracking-wide">
                Datos del Cliente
              </p>
              <p><strong className="text-slate-700">Razón Social:</strong> {quote.clientName}</p>
              <p><strong className="text-slate-700">RUT:</strong> {quote.clientRut}</p>
              <p><strong className="text-slate-700">Correo:</strong> {quote.clientEmail}</p>
              <p><strong className="text-slate-700">Teléfono:</strong> {quote.clientPhone}</p>
              <p><strong className="text-slate-700">Dirección:</strong> {quote.clientAddress}, {quote.clientCommune}</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 uppercase tracking-wide">
                Asesor Comercial a Cargo
              </p>
              <p><strong className="text-slate-700">Nombre:</strong> {quote.sellerName}</p>
              <p><strong className="text-slate-700">Sucursal / Terreno:</strong> Base Maipú & Poniente</p>
              <p><strong className="text-slate-700">Estado Cotización:</strong>{" "}
                <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {quote.status}
                </span>
              </p>
              {quote.convertedOrderId && (
                <p className="text-emerald-700 font-semibold pt-1">
                  Orden de trabajo vinculada: {quote.convertedOrderId}
                </p>
              )}
            </div>
          </div>

          {/* Tabla de Ítems */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Descripción del Servicio / Repuesto</th>
                  <th className="py-2.5 px-3 text-center">Tipo</th>
                  <th className="py-2.5 px-3 text-right">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Precio Unitario</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quote.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-600">
                      {it.code}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {it.name}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        it.isService ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {it.isService ? "Servicio" : "Repuesto"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      {it.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatPrice(it.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatPrice(it.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales y notas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="text-xs text-slate-500 space-y-1.5 border border-slate-200 p-3 rounded-lg">
              <p className="font-semibold text-slate-700">Condiciones Comerciales y de Garantía:</p>
              <p>Incluye mano de obra calificada SEC con instrumental calibrado.</p>
              <p>Garantía técnica oficial de 6 meses sobre repuestos y faenas.</p>
              <p>Tiempo de llegada de cuadrilla coordinado con el asesor comercial.</p>
              {quote.notes && (
                <p className="text-slate-700 font-medium pt-1 italic">
                  Nota del asesor: "{quote.notes}"
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Neto:</span>
                <span className="font-semibold">{formatPrice(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (19%):</span>
                <span className="font-semibold">{formatPrice(quote.iva)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-300 pt-2">
                <span>Total a Pagar (CLP):</span>
                <span className="text-blue-700">{formatPrice(quote.total)}</span>
              </div>
            </div>
          </div>

          {/* Firma y pie de página */}
          <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between text-center gap-4 text-xs text-slate-400">
            <div>
              <div className="w-48 border-b border-slate-400 mx-auto mb-1"></div>
              <p className="font-semibold text-slate-700">Firma / Aprobación del Cliente</p>
              <p className="text-[10px]">{quote.clientName} · {quote.clientRut}</p>
            </div>
            <div>
              <div className="w-48 border-b border-slate-400 mx-auto mb-1"></div>
              <p className="font-semibold text-slate-700">{quote.sellerName}</p>
              <p className="text-[10px]">Asesor Comercial Autorizado · DigitalFix SEC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


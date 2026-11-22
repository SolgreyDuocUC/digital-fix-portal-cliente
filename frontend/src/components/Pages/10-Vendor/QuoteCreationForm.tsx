import React, { useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCatalog } from "@/hooks/useCatalog";
import { QuoteItem } from "@/types/commercial";
import { formatPrice } from "@/utils/currency";

interface QuoteCreationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const SERVICE_TEMPLATES = [
  { id: "TDA", label: "Mantención y Balanceo de Tableros TDA", defaultPrice: 64990, category: "Tableros & Potencia" },
  { id: "TE1", label: "Normalización Eléctrica y Tramitación TE1 SEC", defaultPrice: 189990, category: "Certificación SEC" },
  { id: "EMG", label: "Visita Técnica Eléctrica de Emergencia 24/7", defaultPrice: 34990, category: "Emergencias" },
  { id: "GEN", label: "Prueba y Mantención de Grupo Electrógeno", defaultPrice: 129990, category: "Generadores" },
  { id: "LAV", label: "Revisión Eléctrica de Lavadora / Equipo Industrial", defaultPrice: 69990, category: "Emergencias" },
];

export const QuoteCreationForm: React.FC<QuoteCreationFormProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { products, services } = useCatalog();
  const { communesCoverage, createQuote } = useCommercial();

  // Estados del Formulario (Inspirado en Imagen 1)
  const [clientSearch, setClientSearch] = useState("Superintendencia de Servicios Sanitarios (SISS)");
  const [clientRut, setClientRut] = useState("60.504.000-8");
  const [clientEmail, setClientEmail] = useState("contacto@siss.gob.cl");
  const [clientPhone, setClientPhone] = useState("+56 9 8222 1100");
  const [clientAddress, setClientAddress] = useState("Moneda 673, Piso 7");

  const [sellerName, setSellerName] = useState(user?.fullName || "Rodrigo Valenzuela");
  const [selectedTemplate, setSelectedTemplate] = useState(SERVICE_TEMPLATES[0].label);
  const [selectedCommune, setSelectedCommune] = useState("Maipú");
  const [workType, setWorkType] = useState("Visita Técnica Estándar");

  const [jobTitle, setJobTitle] = useState("Normalización de Tablero de Fuerza y Respaldo");
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [referenceQuote, setReferenceQuote] = useState("#COT-0000008");

  // Switches estilo Imagen 1
  const [isPriorSiteVisitRequired, setIsPriorSiteVisitRequired] = useState(true);
  const [requiresSecOfficialCertification, setRequiresSecOfficialCertification] = useState(true);

  // Ítems de la cotización
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    {
      productId: 2,
      code: "SRV-TAB-02",
      name: "Mantención Preventiva de Tablero General (TDA/TG)",
      category: "Tableros & Potencia",
      quantity: 1,
      unitPrice: 64990,
      subtotal: 64990,
      isService: true,
    },
    {
      productId: 7,
      code: "REP-DIF-25",
      name: "Interruptor Diferencial Bipolar 25A 30mA Schneider",
      category: "Repuestos",
      quantity: 2,
      unitPrice: 22990,
      subtotal: 45980,
      isService: false,
    },
  ]);

  const [notes, setNotes] = useState("Cliente requiere normalización antes de inspección técnica mensual.");

  // Validación de Restricción Comunal para casos especiales
  const communeInfo = communesCoverage.find((c) => c.commune === selectedCommune);
  const hasCommuneRestriction = !!communeInfo?.zoneRestrictionNotes;

  const quoteSubtotal = quoteItems.reduce((acc, it) => acc + it.subtotal, 0);
  const quoteIva = Math.round(quoteSubtotal * 0.19);
  const quoteTotal = quoteSubtotal + quoteIva;

  const handleAddSparePart = (productId: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setQuoteItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        code: prod.code,
        name: prod.name,
        category: prod.category,
        quantity: 1,
        unitPrice: prod.price,
        subtotal: prod.price,
        isService: false,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (asDraft: boolean) => {
    if (!clientSearch.trim()) {
      alert("Por favor indica el cliente.");
      return;
    }
    if (quoteItems.length === 0) {
      alert("Agrega al menos un ítem al presupuesto.");
      return;
    }

    createQuote(
      {
        expiresAt: new Date(Date.now() + 15 * 86400000).toISOString(),
        sellerId: user?.id || "usr-vend-201",
        sellerName,
        clientName: clientSearch.trim(),
        clientRut: clientRut.trim() || "76.123.456-7",
        clientEmail: clientEmail.trim() || "cliente@empresa.cl",
        clientPhone: clientPhone.trim() || "+56 9 8765 4321",
        clientCommune: selectedCommune,
        clientAddress: clientAddress.trim() || `Atención en ${selectedCommune}`,
        jobTitle,
        serviceTypeTemplate: selectedTemplate,
        isPriorSiteVisitRequired,
        requiresSecOfficialCertification,
        referenceQuoteId: referenceQuote,
        items: quoteItems,
        notes,
      },
      asDraft
    );

    onSuccess();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Barra Superior de Navegación del Formulario */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Solicitud de Cotización
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registre los servicios, repuestos, especificaciones técnicas y estructura de costos para el cliente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Volver al listado
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer"
          >
            Guardar Borrador
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            Emitir Solicitud
          </button>
        </div>
      </div>

      {/* TARJETA PRINCIPAL: Información de Solicitud (Diseño de Imagen 1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cabecera de la tarjeta */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Información de Solicitud
            </h2>
            <p className="text-[11px] text-slate-400">
              Defina cliente, asesor a cargo, comuna de atención y alcances técnicos de la faena.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Fila 1: CLIENTE y VENDEDOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Cliente *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Vendedor / Asesor Comercial *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar vendedor..."
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: TIPO DE SERVICIO (PLANTILLA), COMUNA Y DETALLE TÉCNICO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Tipo de Servicio (Plantilla)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {SERVICE_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.label}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Comuna de Atención
              </label>
              <select
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {communesCoverage.map((c) => (
                  <option key={c.commune} value={c.commune}>
                    {c.commune} {c.highlightZone ? "· Zona activa" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Modalidad de Atención
              </label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Visita Técnica Estándar">Visita Técnica Estándar (24-48 hrs)</option>
                <option value="Urgencia Inmediata 24/7">Urgencia Inmediata 24/7 (&lt; 2 hrs)</option>
                <option value="Proyecto Programado">Proyecto Programado de Normalización</option>
              </select>
            </div>
          </div>

          {/* Advertencia si la comuna tiene restricción en casos especiales */}
          {hasCommuneRestriction && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <span>
                <strong>Restricción Zonal Operativa ({selectedCommune}):</strong>{" "}
                {communeInfo?.zoneRestrictionNotes}
              </span>
            </div>
          )}

          {/* Fila 3: NOMBRE DEL TRABAJO (MODELO), CANTIDAD TOTAL Y SOLICITUD DE REFERENCIA */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Nombre del Trabajo o Servicio (Modelo)
              </label>
              <input
                type="text"
                placeholder="Ej: Normalización de Tablero Trifásico TDA"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Cantidad / Puntos
              </label>
              <input
                type="number"
                min="1"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Solicitud de Referencia
              </label>
              <input
                type="text"
                placeholder="Ej: #COT-0000008 o -"
                value={referenceQuote}
                onChange={(e) => setReferenceQuote(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Switches estilo Imagen 1 */}
          <div className="pt-2 flex flex-wrap items-center gap-8 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Visita técnica previa:</span>
              <button
                type="button"
                onClick={() => setIsPriorSiteVisitRequired((v) => !v)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                  isPriorSiteVisitRequired ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    isPriorSiteVisitRequired ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-slate-800">
                {isPriorSiteVisitRequired ? "Sí" : "No"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Lleva certificación SEC (TE1):</span>
              <button
                type="button"
                onClick={() => setRequiresSecOfficialCertification((v) => !v)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                  requiresSecOfficialCertification ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    requiresSecOfficialCertification ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-slate-800">
                {requiresSecOfficialCertification ? "Sí" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Estructura de Costos & Repuestos de Inventario */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Estructura de Costos y Repuestos Asignados
            </h3>
            <p className="text-[11px] text-slate-400">
              Desglose de mano de obra y repuestos homologados por el área operativa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddSparePart(Number(e.target.value));
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="text-xs h-9 px-3 rounded-lg border border-slate-300 bg-white"
            >
              <option value="" disabled>+ Agregar repuesto del inventario...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name} - {formatPrice(p.price)} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Ítem / Descripción</th>
                <th className="py-2.5 px-3 text-center">Tipo</th>
                <th className="py-2.5 px-3 text-right">Cant.</th>
                <th className="py-2.5 px-3 text-right">Precio Unitario</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quoteItems.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-mono font-semibold text-slate-700">{it.code}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{it.name}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      it.isService ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {it.isService ? "Servicio" : "Repuesto"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold">{it.quantity}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{formatPrice(it.unitPrice)}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatPrice(it.subtotal)}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <div className="w-64 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal Neto:</span>
              <span className="font-semibold">{formatPrice(quoteSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>IVA (19%):</span>
              <span className="font-semibold">{formatPrice(quoteIva)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
              <span>Total Cotización:</span>
              <span className="text-blue-700">{formatPrice(quoteTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


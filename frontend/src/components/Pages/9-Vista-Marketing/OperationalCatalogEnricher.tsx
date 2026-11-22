import React, { useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { formatPrice } from "@/utils/currency";
import { resolveDriveImageUrl, isGoogleDriveUrl } from "@/utils/googleDrive";

export const OperationalCatalogEnricher: React.FC = () => {
  const { operationalItems, updateOperationalItemImage } = useCommercial();

  const [selectedItemId, setSelectedItemId] = useState<number>(operationalItems[0]?.id || 1);
  const [driveUrlInput, setDriveUrlInput] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedItem = operationalItems.find((it) => it.id === selectedItemId) || operationalItems[0];
  const directCdnUrl = resolveDriveImageUrl(driveUrlInput || selectedItem?.imageUrl || "");

  const handleSaveEnrichment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrlInput.trim() && !selectedItem.imageUrl) {
      alert("¡Regla Obligatoria DigitalFix!: En el portal del cliente ningún producto o servicio puede estar sin imagen de referencia.");
      return;
    }

    const finalImage = driveUrlInput.trim() || selectedItem.imageUrl || "";
    updateOperationalItemImage(selectedItem.id, finalImage, descriptionInput || selectedItem.description);
    setToastMessage(`Ítem [${selectedItem.code}] enriquecido con imagen y publicado para el portal cliente.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Cabecera */}
      <div className="pb-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest block">
              Enriquecimiento Comercial & Marketing
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Catálogo Operativo hacia Portal Cliente
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              El área operativa registra los ítems planos con stock y restricciones zonales. Como asesor o asistente comercial, debes asignarles descripciones atractivas y la <strong>imagen obligatoria de referencia (Google Drive o web)</strong> antes de que se muestren en la tienda online.
            </p>
          </div>
          <div className="bg-white  p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-brand-600">Regla Estricta del Portal:</p>
            <p>Ningún ítem puede publicarse sin foto.</p>
            <p>Respeta restricciones zonales de faena.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario de Enriquecimiento (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Editar Atributos de Marketing del Producto / Servicio
            </h2>
          </div>

          <form onSubmit={handleSaveEnrichment} className="space-y-4 text-xs">
            {/* Selector de ítem operativo */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                1. Seleccionar Ítem Proveniente de Operaciones
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedItemId(id);
                  const found = operationalItems.find((it) => it.id === id);
                  setDriveUrlInput(found?.imageUrl || "");
                  setDescriptionInput(found?.description || "");
                }}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 text-xs"
              >
                {operationalItems.map((it) => (
                  <option key={it.id} value={it.id}>
                    [{it.code}] {it.name} - Stock: {it.stock} {it.hasMandatoryImage ? "· con foto" : "· falta foto"}
                  </option>
                ))}
              </select>
            </div>

            {/* Datos Técnicos y Restricciones Zonales de Operaciones */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Categoría Operativa:</span>
                <span className="font-bold text-slate-800">{selectedItem?.category}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Precio Venta Público:</span>
                <span className="font-bold text-blue-700">{formatPrice(selectedItem?.salePrice || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Stock Actual en Taller:</span>
                <span className="font-bold text-emerald-700">{selectedItem?.stock} unidades disponibles</span>
              </div>
              {selectedItem?.restrictedCommunes && selectedItem.restrictedCommunes.length > 0 && (
                <div className="pt-2 border-t border-slate-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                  <span>
                    <strong>Restricción Zonal Definida por Operaciones:</strong> No disponible para cuadrillas en: {selectedItem.restrictedCommunes.join(", ")}.
                  </span>
                </div>
              )}
            </div>

            {/* Enlace de Imagen Obligatoria (Google Drive o Web) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>2. Imagen de Referencia Obligatoria (Google Drive o URL) *</span>
                {selectedItem?.hasMandatoryImage ? (
                  <span className="text-emerald-600 font-bold">Cumple requisito</span>
                ) : (
                  <span className="text-red-600 font-bold">Falta imagen obligatoria</span>
                )}
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/... o URL directa"
                value={driveUrlInput}
                onChange={(e) => setDriveUrlInput(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Puedes pegar cualquier enlace de Google Drive compartido; el sistema lo transformará automáticamente a CDN directa.
              </p>
            </div>

            {/* Descripción Comercial */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                3. Descripción Comercial para Clientes
              </label>
              <textarea
                rows={3}
                placeholder="Redacte las opciones del servicio, beneficios y especificaciones atractivas..."
                value={descriptionInput || selectedItem?.description || ""}
                onChange={(e) => setDescriptionInput(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Guardar Imagen y Publicar en Tienda Online
            </button>
          </form>
        </div>

        {/* Previsualización en Vivo de la Tarjeta (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Vista Previa en Tienda Online
            </h3>
            <span className="text-xs text-slate-400">Cliente final</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs max-w-sm mx-auto">
            <div className="relative aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
              {directCdnUrl ? (
                <img
                  src={directCdnUrl}
                  alt={selectedItem?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-slate-400 text-xs">
                  Sin imagen asignada aún
                </div>
              )}
            </div>

            <div className="p-4 space-y-2">
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {selectedItem?.category}
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{selectedItem?.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {descriptionInput || selectedItem?.description}
              </p>
              <div className="text-xl font-bold text-slate-900 pt-1">
                {formatPrice(selectedItem?.salePrice || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

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


import React, { useState } from "react";
import { useCatalog } from "@/hooks/useCatalog";
import { ElectricalProduct } from "@/types/product";
import { CatalogCard } from "@/components/Pages/2-Catalog/CatalogCard";
import { isGoogleDriveUrl, extractDriveFileId, resolveDriveImageUrl } from "@/utils/googleDrive";

/**
 * Vista de Marketing para gestión y vinculación de imágenes desde Google Drive.
 * Permite al equipo de marketing:
 * 1. Seleccionar cualquier producto/servicio del catálogo.
 * 2. Pegar un enlace compartido de Google Drive.
 * 3. Validar en tiempo real la extracción del ID de archivo y la URL directa CDN.
 * 4. Previsualizar la tarjeta (Card) tal como aparecerá en el portal e-commerce.
 * 5. Generar el payload JSON listo para guardar en el backend.
 */
export const MarketingView: React.FC = () => {
  const { products, services } = useCatalog();
  const allItems: ElectricalProduct[] = [...services, ...products];

  const [selectedItemId, setSelectedItemId] = useState<number>(allItems[0]?.id || 1);
  const [driveUrlInput, setDriveUrlInput] = useState<string>("");
  const [customBadge, setCustomBadge] = useState<string>("");
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedItem = allItems.find((i) => i.id === selectedItemId) || allItems[0];

  const isValidDrive = isGoogleDriveUrl(driveUrlInput);
  const fileId = extractDriveFileId(driveUrlInput);
  const directCdnUrl = resolveDriveImageUrl(driveUrlInput);

  // Ítem modificado para previsualización en vivo
  const previewItem: ElectricalProduct = selectedItem
    ? {
        ...selectedItem,
        imageUrl: isValidDrive ? directCdnUrl : selectedItem.imageUrl,
        highlightBadge: customBadge || selectedItem.highlightBadge,
        originalPrice:
          customDiscount > 0
            ? Math.round(selectedItem.price / (1 - customDiscount / 100))
            : selectedItem.originalPrice,
      }
    : ({} as ElectricalProduct);

  const handleCopyPayload = () => {
    const payload = {
      productId: selectedItem.id,
      productCode: selectedItem.code,
      productName: selectedItem.name,
      googleDriveUrl: driveUrlInput,
      extractedFileId: fileId,
      directCdnUrl: directCdnUrl,
      highlightBadge: customBadge || selectedItem.highlightBadge,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Encabezado */}
      <div className="pb-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-brand-600 text-xs font-semibold mb-2 border border-slate-200">
              Equipo de Marketing & Catálogo
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Vinculador de Imágenes Google Drive
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Pega cualquier enlace compartido de Google Drive para transformar y publicar instantáneamente fotos comerciales en las tarjetas del e-commerce.
            </p>
          </div>
          <div className="bg-white  px-4 py-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-600 block font-semibold">Formatos Google Drive soportados:</span>
            <code className="text-brand-600 block">drive.google.com/file/d/ID/view</code>
            <code className="text-brand-600 block">drive.google.com/open?id=ID</code>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Panel de Configuración (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            Configuración del Ítem Comercial
          </h2>

          {/* 1. Selector de Producto / Servicio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. Seleccionar Producto o Servicio a Publicitar
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(Number(e.target.value));
                setDriveUrlInput("");
              }}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <optgroup label="Servicios Eléctricos en Terreno">
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name} - ${s.price.toLocaleString("es-CL")}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Repuestos e Insumos en Stock">
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} - ${p.price.toLocaleString("es-CL")}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 2. Enlace de Google Drive */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. Enlace Compartido de Google Drive *
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/1A2B3C4D5E.../view?usp=sharing"
                value={driveUrlInput}
                onChange={(e) => setDriveUrlInput(e.target.value)}
                className={`w-full h-11 pl-3 pr-10 rounded-lg border text-sm outline-none transition ${
                  driveUrlInput && isValidDrive
                    ? "border-emerald-500 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-100"
                    : driveUrlInput && !isValidDrive
                    ? "border-amber-400 bg-amber-50/20 focus:ring-2 focus:ring-amber-100"
                    : "border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>

            {/* Feedback en tiempo real */}
            {driveUrlInput && (
              <div className="mt-2 text-xs">
                {isValidDrive && fileId ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      Enlace válido de Google Drive reconocido
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      <strong>File ID:</strong> <code className="bg-white/80 px-1 py-0.5 rounded">{fileId}</code>
                    </p>
                    <p className="text-[11px] text-emerald-700 break-all">
                      <strong>CDN Directa:</strong> <a href={directCdnUrl} target="_blank" rel="noreferrer" className="underline">{directCdnUrl}</a>
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                    Debe ser un enlace de Google Drive (ej: <code>https://drive.google.com/file/d/...</code>) con permisos de lectura pública ("Cualquiera con el enlace").
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Badges y Descuentos de Marketing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Badge Promocional
              </label>
              <input
                type="text"
                placeholder="Ej: OFERTA FLASH, MÁS VENDIDO"
                value={customBadge}
                onChange={(e) => setCustomBadge(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {["OFERTA FLASH", "MÁS PEDIDO", "SEC OFICIAL", "STOCK INMEDIATO"].map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => setCustomBadge(badge)}
                    className="text-[10px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2 py-0.5 rounded cursor-pointer transition"
                  >
                    +{badge}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descuento Visual (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(Number(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer"
                />
                <span className="w-12 text-center text-xs font-bold text-slate-800 bg-slate-100 py-1.5 rounded">
                  {customDiscount}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Calcula automáticamente el precio original tachado.
              </p>
            </div>
          </div>

          {/* Acciones de Exportación */}
          <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Sincronización lista con <code>digitalfix-ms-catalog</code>
            </span>
            <button
              type="button"
              onClick={handleCopyPayload}
              disabled={!isValidDrive}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {copied ? "¡JSON Copiado al Portapapeles!" : "Copiar Configuración para Backend"}
            </button>
          </div>
        </div>

        {/* Previsualización en Vivo de la Tarjeta (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              Vista Previa en Vivo (E-commerce Card)
            </h2>
            <span className="text-[11px] text-slate-500">
              Así lo verá el cliente final
            </span>
          </div>

          {/* Renderizado real del componente CatalogCard */}
          <div className="max-w-[340px] mx-auto lg:mx-0">
            {previewItem && (
              <CatalogCard
                item={previewItem}
                actionLabel={previewItem.category === "Repuestos" ? "Agregar al carrito" : "Solicitar"}
                onAction={() => alert(`Previsualización: Acción sobre "${previewItem.name}"`)}
              />
            )}
          </div>

          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-xs text-sky-900 space-y-1.5">
            <h4 className="font-semibold flex items-center gap-1.5 text-blue-900">
              E-commerce Desacoplado ISO 25010
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Las imágenes renderizadas a través de este canal quedan desacopladas del ERP técnico interno. Los clientes B2C/B2B disfrutan de carga rápida y CDN directa sin exponer credenciales de Google Workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


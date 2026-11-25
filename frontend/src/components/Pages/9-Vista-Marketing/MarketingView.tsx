import React, { useState, useMemo } from "react";
import { useCatalog } from "@/hooks/useCatalog";
import { ElectricalProduct } from "@/types/product";
import { CatalogCard } from "@/components/Pages/2-Catalog/CatalogCard";
import {
  isGoogleDriveUrl,
  extractDriveFileId,
  resolveDriveImageUrl,
} from "@/utils/googleDrive";

type FilterTab = "ALL" | "SERVICES" | "PRODUCTS" | "MISSING_IMAGE";

export const MarketingView: React.FC = () => {
  const { products, services } = useCatalog();

  const allItems = useMemo<ElectricalProduct[]>(
    () => [
      ...services.map((s) => ({ ...s, _type: "Servicio" as const })),
      ...products.map((p) => ({ ...p, _type: "Repuesto" as const })),
    ],
    [services, products]
  );

  // Filtros de tabla (mismo patrón que CatalogoComponent)
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Estado del Modal de Edición / Vinculación
  const [selectedItem, setSelectedItem] = useState<ElectricalProduct | null>(null);
  const [driveUrlInput, setDriveUrlInput] = useState<string>("");
  const [customBadge, setCustomBadge] = useState<string>("");
  const [customDiscount, setCustomDiscount] = useState<number>(0);

  // Registro local de cambios aplicados en sesión + notificación discreta
  const [updatedPayloads, setUpdatedPayloads] = useState<Record<number, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Contadores para chips
  const counts = useMemo(() => {
    const missing = allItems.filter((i) => !i.imageUrl && !updatedPayloads[i.id]).length;
    return {
      all: allItems.length,
      services: services.length,
      products: products.length,
      missing,
    };
  }, [allItems, services.length, products.length, updatedPayloads]);

  // Filtrado tabular
  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allItems.filter((item) => {
      const hasImg = Boolean(updatedPayloads[item.id] || item.imageUrl);
      if (activeFilter === "SERVICES" && item.category === "Repuestos") return false;
      if (activeFilter === "PRODUCTS" && item.category !== "Repuestos") return false;
      if (activeFilter === "MISSING_IMAGE" && hasImg) return false;

      if (!q) return true;
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [allItems, activeFilter, searchTerm, updatedPayloads]);

  // Abrir modal para un ítem
  const openEditModal = (item: ElectricalProduct) => {
    setSelectedItem(item);
    setDriveUrlInput(updatedPayloads[item.id] || "");
    setCustomBadge(item.highlightBadge || "");
    setCustomDiscount(0);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setDriveUrlInput("");
    setCustomBadge("");
    setCustomDiscount(0);
  };

  // Validación en tiempo real dentro del modal
  const isValidDrive = isGoogleDriveUrl(driveUrlInput);
  const fileId = extractDriveFileId(driveUrlInput);
  const directCdnUrl = resolveDriveImageUrl(driveUrlInput);

  const previewItem: ElectricalProduct | null = selectedItem
    ? {
        ...selectedItem,
        imageUrl: isValidDrive
          ? directCdnUrl
          : updatedPayloads[selectedItem.id] || selectedItem.imageUrl,
        highlightBadge: customBadge.trim() || selectedItem.highlightBadge,
        originalPrice:
          customDiscount > 0
            ? Math.round(selectedItem.price / (1 - customDiscount / 100))
            : selectedItem.originalPrice,
      }
    : null;

  const handleSaveAndCopy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !isValidDrive) return;

    const payload = {
      productId: selectedItem.id,
      productCode: selectedItem.code,
      productName: selectedItem.name,
      googleDriveUrl: driveUrlInput.trim(),
      extractedFileId: fileId,
      directCdnUrl,
      highlightBadge: customBadge.trim() || selectedItem.highlightBadge || null,
    };

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setUpdatedPayloads((prev) => ({ ...prev, [selectedItem.id]: directCdnUrl }));
    showToast(`Imagen vinculada para ${selectedItem.code} y JSON copiado al portapapeles.`);
    closeModal();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-5 animate-fadeIn">
      {/* Cabecera estilo ERP */}
      <header className="page-head mb-0">
        <div>
          <h1>Imágenes de catálogo</h1>
          <p>Vinculación de recursos gráficos desde Google Drive para el portal comercial</p>
        </div>
      </header>

      {/* Panel principal tabular */}
      <section className="panel overflow-hidden">
        {/* Chips de filtro */}
        <div
          role="tablist"
          aria-label="Filtrar catálogo"
          className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-2 border-b border-slate-100"
        >
          {[
            { id: "ALL" as const, label: "Todos", count: counts.all },
            { id: "SERVICES" as const, label: "Servicios", count: counts.services },
            { id: "PRODUCTS" as const, label: "Repuestos", count: counts.products },
            { id: "MISSING_IMAGE" as const, label: "Sin imagen", count: counts.missing },
          ].map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveFilter(tab.id)}
                className={`inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[11px] tabular-nums ${
                    active
                      ? "bg-brand-700 text-brand-50"
                      : "bg-white text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Barra de búsqueda */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200">
          <div className="search-group max-w-md !bg-white">
            <input
              type="search"
              placeholder="Buscar por código, nombre o categoría..."
              aria-label="Buscar en el catálogo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="px-2 text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Tabla de ítems */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Código</th>
                <th className="py-3 px-4">Ítem comercial</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Estado imagen</th>
                <th className="py-3 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {filteredItems.map((item) => {
                const resolvedImg = updatedPayloads[item.id] || item.imageUrl;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-5 font-mono text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {item.code}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-mono text-slate-400">
                          {resolvedImg ? (
                            <img
                              src={resolvedImg}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "N/A"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                            {item.name}
                          </div>
                          {item.highlightBadge && (
                            <span className="text-[11px] text-brand-600 font-medium">
                              Etiqueta: {item.highlightBadge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {item.category}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      ${item.price.toLocaleString("es-CL")}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {resolvedImg ? (
                        <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Vinculada
                        </span>
                      ) : (
                        <span className="badge bg-amber-50 text-amber-700 border border-amber-200">
                          Sin imagen
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="btn-secondary !min-h-[32px] !px-3 !text-xs"
                      >
                        {resolvedImg ? "Cambiar imagen" : "Vincular imagen"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                    No hay ítems que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Vinculación y Vista Previa (idéntico flujo a CatalogoComponent) */}
      {selectedItem && previewItem && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-img-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 id="modal-img-title" className="text-base font-bold text-slate-900">
                  Vincular imagen · {selectedItem.code}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedItem.name} · Los campos con * son obligatorios.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="btn-ghost !min-h-[32px] !px-2.5 text-slate-500"
              >
                Cerrar
              </button>
            </div>

            {/* Cuerpo del Modal: Formulario a la izquierda + Preview real a la derecha */}
            <form onSubmit={handleSaveAndCopy} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Controles (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="label" htmlFor="drive-url">
                      Enlace compartido de Google Drive *
                    </label>
                    <input
                      id="drive-url"
                      type="url"
                      placeholder="https://drive.google.com/file/d/.../view"
                      value={driveUrlInput}
                      onChange={(e) => setDriveUrlInput(e.target.value)}
                      required
                      className="input font-mono text-xs"
                    />
                    {driveUrlInput && !isValidDrive && (
                      <p className="text-[11px] text-red-600 mt-1">
                        Ingrese un enlace válido de Google Drive con acceso público de lectura.
                      </p>
                    )}
                    {isValidDrive && fileId && (
                      <p className="text-[11px] text-emerald-700 mt-1 font-mono">
                        ID reconocido: {fileId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label" htmlFor="promo-badge">
                      Etiqueta destacada (opcional)
                    </label>
                    <input
                      id="promo-badge"
                      type="text"
                      placeholder="Ej: OFERTA, SEC OFICIAL, STOCK INMEDIATO"
                      value={customBadge}
                      onChange={(e) => setCustomBadge(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="visual-discount">
                      Descuento referencial en tarjeta ({customDiscount}%)
                    </label>
                    <input
                      id="visual-discount"
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={customDiscount}
                      onChange={(e) => setCustomDiscount(Number(e.target.value))}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Calcula el precio anterior tachado para previsualización.
                    </p>
                  </div>
                </div>

                {/* Vista previa compacta (5 cols) */}
                <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="eyebrow block">Vista previa en portal</span>
                  <div className="pointer-events-none">
                    <CatalogCard
                      item={previewItem}
                      actionLabel={
                        previewItem.category === "Repuestos"
                          ? "Agregar al carrito"
                          : "Solicitar"
                      }
                      onAction={() => {}}
                    />
                  </div>
                </div>
              </div>

              {/* Pie del Modal */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isValidDrive}
                  className="btn-primary"
                >
                  Guardar y copiar JSON
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notificación discreta */}
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
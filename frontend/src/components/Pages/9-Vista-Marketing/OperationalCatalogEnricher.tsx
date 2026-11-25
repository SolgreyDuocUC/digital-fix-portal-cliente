import React, { useMemo, useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { OperationalProductCatalogItem } from "@/types/commercial";
import { formatPrice } from "@/utils/currency";
import { resolveDriveImageUrl } from "@/utils/googleDrive";

type ImageFilter = "ALL" | "MISSING" | "READY";

interface OperationalCatalogEnricherProps {
  embedded?: boolean;
}

export const OperationalCatalogEnricher: React.FC<OperationalCatalogEnricherProps> = ({
  embedded = false,
}) => {
  const { operationalItems, updateOperationalItemImage } = useCommercial();

  const [filter, setFilter] = useState<ImageFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingItem, setEditingItem] = useState<OperationalProductCatalogItem | null>(null);
  const [driveUrlInput, setDriveUrlInput] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const counts = useMemo(() => {
    const ready = operationalItems.filter((i) => i.hasMandatoryImage || Boolean(i.imageUrl)).length;
    return {
      all: operationalItems.length,
      ready,
      missing: operationalItems.length - ready,
    };
  }, [operationalItems]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return operationalItems.filter((item) => {
      const hasImg = item.hasMandatoryImage || Boolean(item.imageUrl);
      if (filter === "MISSING" && hasImg) return false;
      if (filter === "READY" && !hasImg) return false;
      if (!q) return true;
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [operationalItems, filter, searchTerm]);

  const openModal = (item: OperationalProductCatalogItem) => {
    setEditingItem(item);
    setDriveUrlInput(item.imageUrl || "");
    setDescriptionInput(item.description || "");
    setFormError(null);
  };

  const closeModal = () => {
    setEditingItem(null);
    setDriveUrlInput("");
    setDescriptionInput("");
    setFormError(null);
  };

  const handleSaveEnrichment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const finalImage = driveUrlInput.trim() || editingItem.imageUrl || "";
    if (!finalImage) {
      setFormError("Ingresa una URL de imagen válida (Google Drive o enlace directo) para publicar el ítem.");
      return;
    }

    updateOperationalItemImage(
      editingItem.id,
      finalImage,
      descriptionInput.trim() || editingItem.description
    );
    setToastMessage(`Ficha de ${editingItem.code} actualizada para el portal cliente.`);
    closeModal();
    setTimeout(() => setToastMessage(null), 5000);
  };

  const previewImageUrl = resolveDriveImageUrl(driveUrlInput || editingItem?.imageUrl || "");

  return (
    <div className={embedded ? "w-full space-y-6 animate-fadeIn" : "w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn"}>
      <header className="page-head mb-0">
        <div>
          <span className="eyebrow">Catálogo Operativo</span>
          <h1 className="mt-1">Fichas e Imágenes Comerciales</h1>
          <p>
            Asignación de fotografías desde Google Drive, descripción comercial y validación de restricciones zonales.
          </p>
        </div>
      </header>

      <section className="panel overflow-hidden">
        {/* Chips de filtro */}
        <div
          role="tablist"
          aria-label="Filtrar ítems por estado de imagen"
          className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-2 border-b border-slate-100"
        >
          {(
            [
              { id: "ALL", label: "Todos", count: counts.all },
              { id: "MISSING", label: "Sin imagen", count: counts.missing },
              { id: "READY", label: "Con imagen", count: counts.ready },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
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

        {/* Buscador */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200">
          <div className="search-group max-w-md !bg-white">
            <input
              type="search"
              placeholder="Buscar por código, nombre o categoría..."
              aria-label="Buscar en catálogo operativo"
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

        {/* Tabla operativa */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Código</th>
                <th className="py-3 px-4">Ítem</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-right">Stock</th>
                <th className="py-3 px-4">Estado Imagen</th>
                <th className="py-3 px-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {filteredItems.map((item) => {
                const hasImg = item.hasMandatoryImage || Boolean(item.imageUrl);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                      {item.restrictedCommunes && item.restrictedCommunes.length > 0 && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Restricción: {item.restrictedCommunes.join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatPrice(item.salePrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 tabular-nums whitespace-nowrap">
                      {item.stock}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`badge ${
                          hasImg
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {hasImg ? "Publicada" : "Sin imagen"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openModal(item)}
                        className="btn-secondary !min-h-[32px] !px-3 !text-xs"
                      >
                        Editar ficha
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                    No hay ítems que coincidan con el filtro aplicado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal limpio de edición y vista previa */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enrich-modal-title"
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="eyebrow tabular-nums">{editingItem.code}</span>
                <h2 id="enrich-modal-title" className="text-base font-bold text-slate-900 truncate">
                  {editingItem.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="btn-ghost !min-h-[32px] !px-2.5 !text-xs"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveEnrichment} className="p-6 space-y-5 overflow-y-auto">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                >
                  {formError}
                </div>
              )}

              {/* Ficha técnica resumida */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="block text-slate-500">Categoría</span>
                  <span className="font-semibold text-slate-900">{editingItem.category}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Precio venta</span>
                  <span className="font-bold text-brand-700 tabular-nums">
                    {formatPrice(editingItem.salePrice)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Stock taller</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {editingItem.stock} un.
                  </span>
                </div>
              </div>

              {editingItem.restrictedCommunes && editingItem.restrictedCommunes.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  Restricción zonal: {editingItem.restrictedCommunes.join(", ")}.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="label" htmlFor="enrich-drive-url">
                      Enlace de imagen (Google Drive o URL) *
                    </label>
                    <input
                      id="enrich-drive-url"
                      type="url"
                      placeholder="https://drive.google.com/file/d/... o https://..."
                      value={driveUrlInput}
                      onChange={(e) => {
                        setDriveUrlInput(e.target.value);
                        setFormError(null);
                      }}
                      className="input font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="enrich-desc">
                      Descripción comercial
                    </label>
                    <textarea
                      id="enrich-desc"
                      rows={4}
                      placeholder="Beneficios y especificaciones para clientes..."
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 outline-none transition-all hover:border-slate-400 focus:border-brand-600 focus:ring-3 focus:ring-brand-200/70"
                    />
                  </div>
                </div>

                {/* Vista previa compacta */}
                <div className="md:col-span-5">
                  <span className="label">Vista previa en tienda</span>
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
                      {previewImageUrl ? (
                        <img
                          src={previewImageUrl}
                          alt={editingItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">Sin imagen asignada</span>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">
                        {editingItem.name}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {descriptionInput || editingItem.description}
                      </p>
                      <p className="text-sm font-bold text-brand-700 tabular-nums pt-0.5">
                        {formatPrice(editingItem.salePrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary px-5">
                  Guardar y publicar
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

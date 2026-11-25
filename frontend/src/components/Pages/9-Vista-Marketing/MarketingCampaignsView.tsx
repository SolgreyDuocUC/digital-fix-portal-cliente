import React, { useEffect, useState, useMemo } from "react";
import { useCatalog } from "@/hooks/useCatalog";
import { useCommercial } from "@/contexts/CommercialContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/utils/currency";
import { resolveDriveImageUrl } from "@/utils/googleDrive";
import { OperationalCatalogEnricher } from "./OperationalCatalogEnricher";
import { ReviewsAnalyticsView } from "../12-Reviews/ReviewsAnalyticsView";
import { QuickAccessList, QuickAccessItem } from "@/components/ui/QuickAccessList";

export type MktSubView = "hub" | "new-campaign" | "history" | "enrichment" | "reviews";

interface MarketingCampaignsViewProps {
  initialSubView?: MktSubView;
}

const STATUS_BADGE: Record<string, string> = {
  APROBADA: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  RECHAZADA: "bg-red-50 text-red-700 border border-red-200",
};

const VIEW_LABELS: Record<MktSubView, string> = {
  hub: "Accesos Rápidos",
  "new-campaign": "Nueva Solicitud de Promoción",
  history: "Registro de Campañas",
  enrichment: "Catálogo e Imágenes",
  reviews: "Reseñas y Críticas",
};

export const MarketingCampaignsView: React.FC<MarketingCampaignsViewProps> = ({
  initialSubView = "hub",
}) => {
  const { user } = useAuth();
  const { services, products } = useCatalog();
  const { campaigns, createCampaign } = useCommercial();

  const [subView, setSubView] = useState<MktSubView>(initialSubView);

  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);

  const allItems = useMemo(() => [...services, ...products], [services, products]);

  // Estado del Formulario de Campaña
  const [title, setTitle] = useState(
    "Revisión de tableros + limpieza de componentes con 30% de descuento"
  );
  const [description, setDescription] = useState(
    "Mantenimiento integral termográfico y desengrase dieléctrico para prevenir recalentamientos y caídas de suministro."
  );
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([2, 7]);
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [regularPrice, setRegularPrice] = useState<number>(99990);
  const [promoPrice, setPromoPrice] = useState<number>(69990);
  const [validUntil, setValidUntil] = useState<string>("2026-11-28");
  const [photoUrl, setPhotoUrl] = useState<string>(
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
  );
  const [itemFilter, setItemFilter] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const directPhotoUrl = resolveDriveImageUrl(photoUrl);

  const selectedItems = useMemo(
    () => allItems.filter((i) => selectedItemIds.includes(i.id)),
    [allItems, selectedItemIds]
  );

  const filteredCatalogItems = useMemo(() => {
    const q = itemFilter.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q)
    );
  }, [allItems, itemFilter]);

  const stats = useMemo(() => {
    const approved = campaigns.filter((c) => c.status === "APROBADA").length;
    const pending = campaigns.filter(
      (c) => c.status !== "APROBADA" && c.status !== "RECHAZADA"
    ).length;

    return {
      total: campaigns.length,
      pending,
      approved,
    };
  }, [campaigns]);

  const toggleItemSelection = (id: number) => {
    const nextIds = selectedItemIds.includes(id)
      ? selectedItemIds.filter((i) => i !== id)
      : [...selectedItemIds, id];

    setSelectedItemIds(nextIds);
    setFormError(null);

    const sumRegular = allItems
      .filter((i) => nextIds.includes(i.id))
      .reduce((acc, item) => acc + item.price, 0);

    if (sumRegular > 0) {
      setRegularPrice(sumRegular);
      setPromoPrice(Math.round(sumRegular * (1 - discountPercent / 100)));
    }
  };

  const handleDiscountChange = (disc: number) => {
    const clamped = Math.max(0, Math.min(90, disc));
    setDiscountPercent(clamped);
    setPromoPrice(Math.round(regularPrice * (1 - clamped / 100)));
  };

  const handleRegularPriceChange = (reg: number) => {
    const safeReg = Math.max(0, reg);
    setRegularPrice(safeReg);
    setPromoPrice(Math.round(safeReg * (1 - discountPercent / 100)));
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedItemIds.length === 0) {
      setFormError("Debe asociar al menos un servicio o producto del catálogo.");
      return;
    }
    if (!photoUrl.trim()) {
      setFormError("Debe ingresar una URL de imagen de respaldo para la campaña.");
      return;
    }

    createCampaign({
      createdBy: `${user?.fullName || "Constanza Morales"} (${
        user?.department || "Operaciones Comerciales"
      })`,
      title: title.trim(),
      description: description.trim(),
      associatedItemIds: selectedItemIds,
      associatedItemNames: selectedItems.map((i) => i.name),
      discountPercentage: discountPercent,
      promoPrice,
      regularPrice,
      validUntil,
      referencePhotoUrl: photoUrl.trim(),
    });

    setToastMessage("Solicitud registrada. Enviada a Jefatura de Ventas para aprobación.");
    setSubView("history");
    setTimeout(() => setToastMessage(null), 5000);
  };

  const quickAccessItems: QuickAccessItem[] = [
    {
      id: "new-campaign",
      title: "Registro de Nueva Campaña Promocional",
      description:
        "Formulario comercial para asociar servicios o repuestos, definir descuentos, vigencia y fotografía de respaldo.",
      onClick: () => setSubView("new-campaign"),
    },
    {
      id: "history",
      title: `Registro y Estado de Campañas (${stats.total})`,
      description: `Listado de solicitudes comerciales enviadas a Jefatura de Ventas (${stats.approved} activas · ${stats.pending} en revisión).`,
      onClick: () => setSubView("history"),
    },
    {
      id: "enrichment",
      title: "Catálogo & Imágenes de Productos y Servicios",
      description:
        "Enriquecimiento visual con fotografías obligatorias desde Google Drive y configuración comercial.",
      onClick: () => setSubView("enrichment"),
    },
    {
      id: "reviews",
      title: "Reseñas, Críticas y Oportunidades de Mejora",
      description:
        "Monitoreo del feedback de clientes post-servicio, métricas de satisfacción y planes de acción.",
      onClick: () => setSubView("reviews"),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Barra superior de navegación tipo breadcrumb (igual que Ventas) */}
      <div className="panel px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSubView("hub")}
            className="font-semibold text-slate-600 hover:text-brand-600 transition-colors cursor-pointer"
          >
            Módulo de Marketing & Catálogo
          </button>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-slate-900">{VIEW_LABELS[subView]}</span>
        </div>

        {/* Píldoras de cambio rápido entre sub-vistas */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "hub" as const, label: "Hub" },
            { id: "new-campaign" as const, label: "+ Nueva Campaña" },
            { id: "history" as const, label: "Campañas" },
            { id: "enrichment" as const, label: "Catálogo & Imágenes" },
            { id: "reviews" as const, label: "Reseñas & Críticas" },
          ].map((pill) => {
            const active = subView === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSubView(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          SUB-VISTA 1: HUB PRINCIPAL (Tarjeta módulo + Accesos Rápidos)
         ===================================================================== */}
      {subView === "hub" && (
        <>
          <section className="panel p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <span className="eyebrow">Módulo del Sistema</span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Operaciones Comerciales y Marketing
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gestiona solicitudes de campañas promocionales, vinculación de fotografías desde Google Drive y seguimiento de evaluaciones de clientes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSubView("new-campaign")}
              className="btn-primary h-10 px-5 shrink-0"
            >
              Nueva campaña
            </button>
          </section>

          <QuickAccessList items={quickAccessItems} />
        </>
      )}

      {/* =====================================================================
          SUB-VISTA 2: FORMULARIO NUEVA CAMPAÑA + VISTA PREVIA
         ===================================================================== */}
      {subView === "new-campaign" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulario (7 cols) */}
          <section className="lg:col-span-7 panel overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-slate-900">
                Nueva Solicitud de Promoción
              </h2>
              <span className="badge bg-brand-50 text-brand-700 border border-brand-200">
                Requiere aprobación
              </span>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-5">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                >
                  {formError}
                </div>
              )}

              <div>
                <label className="label" htmlFor="camp-title">
                  Título comercial de la campaña *
                </label>
                <input
                  id="camp-title"
                  type="text"
                  placeholder="Ej: Mantenimiento preventivo de tableros con 30% de descuento"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input font-medium"
                />
              </div>

              <div>
                <label className="label" htmlFor="camp-desc">
                  Alcance y condiciones *
                </label>
                <textarea
                  id="camp-desc"
                  rows={2}
                  placeholder="Especifique alcance técnico, exclusiones y condiciones comerciales..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 outline-none transition-all hover:border-slate-400 focus:border-brand-600 focus:ring-3 focus:ring-brand-200/70"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label !mb-0">Ítems incluidos del catálogo *</label>
                  <span className="text-[11px] font-semibold text-brand-600 tabular-nums">
                    {selectedItemIds.length} seleccionados
                  </span>
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <input
                      type="text"
                      placeholder="Filtrar por código o nombre de servicio/repuesto..."
                      value={itemFilter}
                      onChange={(e) => setItemFilter(e.target.value)}
                      className="w-full text-xs bg-transparent text-slate-800 placeholder:text-slate-400 outline-none"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
                    {filteredCatalogItems.map((it) => {
                      const isChecked = selectedItemIds.includes(it.id);
                      return (
                        <label
                          key={it.id}
                          className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-brand-50/70 text-slate-900"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItemSelection(it.id)}
                              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="font-mono text-[11px] text-slate-500 shrink-0">
                              {it.code}
                            </span>
                            <span className="font-medium truncate">{it.name}</span>
                          </div>
                          <span className="font-mono text-xs text-slate-700 font-semibold tabular-nums shrink-0">
                            {formatPrice(it.price)}
                          </span>
                        </label>
                      );
                    })}
                    {filteredCatalogItems.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-500">
                        Sin coincidencias en el catálogo.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="label" htmlFor="camp-reg">
                    Precio lista (CLP)
                  </label>
                  <input
                    id="camp-reg"
                    type="number"
                    min="0"
                    step="1000"
                    value={regularPrice}
                    onChange={(e) => handleRegularPriceChange(Number(e.target.value))}
                    className="input tabular-nums"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="camp-disc">
                    Descuento (%) *
                  </label>
                  <input
                    id="camp-disc"
                    type="number"
                    min="0"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    required
                    className="input font-semibold tabular-nums"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="camp-promo">
                    Precio oferta (CLP) *
                  </label>
                  <input
                    id="camp-promo"
                    type="number"
                    min="0"
                    step="1000"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(Number(e.target.value))}
                    required
                    className="input font-bold text-brand-700 tabular-nums"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="camp-date">
                    Vigencia hasta *
                  </label>
                  <input
                    id="camp-date"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                    className="input tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="camp-photo">
                  Recurso gráfico (URL directa o enlace de Google Drive) *
                </label>
                <input
                  id="camp-photo"
                  type="url"
                  placeholder="https://drive.google.com/file/d/... o https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  required
                  className="input font-mono text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubView("hub")}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary px-6">
                  Enviar a aprobación de Jefatura
                </button>
              </div>
            </form>
          </section>

          {/* Vista Previa (5 cols) */}
          <section className="lg:col-span-5 panel overflow-hidden">
            <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Vista previa en Portal Cliente
              </span>
              <span className="text-[11px] text-slate-500">Render en vivo</span>
            </div>

            <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden border-b border-slate-200">
              <img
                src={directPhotoUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="absolute top-3 left-3 badge bg-brand-600 text-white shadow-xs">
                -{discountPercent}% OFF
              </span>
              <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-slate-900/85 text-white text-[11px] font-medium tabular-nums">
                Válido hasta{" "}
                {validUntil
                  ? new Date(validUntil + "T00:00:00").toLocaleDateString("es-CL")
                  : "—"}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {title || "Sin título definido"}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {description || "Sin descripción comercial."}
                </p>
              </div>

              <div className="flex items-baseline gap-2.5 pt-1">
                <span className="text-xl font-bold text-brand-700 tabular-nums">
                  {formatPrice(promoPrice)}
                </span>
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatPrice(regularPrice)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Ítems asociados: </span>
                {selectedItems.length > 0
                  ? selectedItems.map((i) => `${i.code} (${i.name})`).join(" · ")
                  : "Ninguno"}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          SUB-VISTA 3: BITÁCORA TABULAR DE CAMPAÑAS
         ===================================================================== */}
      {subView === "history" && (
        <section className="panel overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Registro de Solicitudes Comerciales ({campaigns.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                Estado de aprobación y vigencia de campañas enviadas a Jefatura
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubView("new-campaign")}
              className="btn-primary !min-h-[34px] !px-3.5 !text-xs"
            >
              Nueva campaña
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Campaña</th>
                  <th className="py-3 px-4">Descuento</th>
                  <th className="py-3 px-4">Precio Oferta</th>
                  <th className="py-3 px-4">Vigencia</th>
                  <th className="py-3 px-6 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-slate-900">{c.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                        {c.associatedItemNames?.join(" · ") || c.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-700 tabular-nums">
                      -{c.discountPercentage}%
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                      {formatPrice(c.promoPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 tabular-nums">
                      {c.validUntil}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span
                        className={`badge ${
                          STATUS_BADGE[c.status] ??
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                      No existen solicitudes de campaña registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =====================================================================
          SUB-VISTA 4 Y 5: CATÁLOGO E IMÁGENES / RESEÑAS
         ===================================================================== */}
      {subView === "enrichment" && <OperationalCatalogEnricher embedded />}

      {subView === "reviews" && <ReviewsAnalyticsView embedded />}

      {/* Notificación operativa discreta */}
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
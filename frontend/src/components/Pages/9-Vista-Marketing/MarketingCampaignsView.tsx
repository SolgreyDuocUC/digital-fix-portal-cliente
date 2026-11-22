import React, { useState } from "react";
import { useCatalog } from "@/hooks/useCatalog";
import { useCommercial } from "@/contexts/CommercialContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/utils/currency";
import { isGoogleDriveUrl, resolveDriveImageUrl } from "@/utils/googleDrive";
import { OperationalCatalogEnricher } from "./OperationalCatalogEnricher";
import { ReviewsAnalyticsView } from "../12-Reviews/ReviewsAnalyticsView";

export const MarketingCampaignsView: React.FC = () => {
  const { user } = useAuth();
  const { services, products } = useCatalog();
  const { campaigns, createCampaign } = useCommercial();

  const [activeMktTab, setActiveMktTab] = useState<"campaigns" | "enrichment" | "reviews">("campaigns");

  const allItems = [...services, ...products];

  // Estado del Formulario de Campaña
  const [title, setTitle] = useState("Revisión de tableros + limpieza de componentes con 30% de descuento");
  const [description, setDescription] = useState(
    "Mantenimiento integral termográfico y desengrase dieléctrico para prevenir recalentamientos y caídas de suministro."
  );
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([2, 7]);
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [promoPrice, setPromoPrice] = useState<number>(69990);
  const [regularPrice, setRegularPrice] = useState<number>(99990);
  const [validUntil, setValidUntil] = useState<string>("2026-11-28");
  const [photoUrl, setPhotoUrl] = useState<string>(
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const directPhotoUrl = resolveDriveImageUrl(photoUrl);

  const toggleItemSelection = (id: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemIds.length === 0) {
      alert("Selecciona al menos un producto o servicio del catálogo para armar la campaña.");
      return;
    }
    if (!photoUrl.trim()) {
      alert("El sistema requiere que agregues una foto o enlace de Google Drive de referencia de la promoción.");
      return;
    }

    const itemNames = allItems
      .filter((i) => selectedItemIds.includes(i.id))
      .map((i) => i.name);

    createCampaign({
      createdBy: `${user?.fullName || "Constanza Morales"} (${user?.department || "Operaciones Comerciales"})`,
      title: title.trim(),
      description: description.trim(),
      associatedItemIds: selectedItemIds,
      associatedItemNames: itemNames,
      discountPercentage: discountPercent,
      promoPrice,
      regularPrice,
      validUntil,
      referencePhotoUrl: photoUrl.trim(),
    });

    setToastMessage(
      "¡Solicitud de Promoción de Ventas enviada al Jefe de Ventas y Operaciones para su aprobación!"
    );
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Encabezado Asistente Comercial */}
      <div className="pb-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-brand-600 text-xs font-semibold border border-slate-200">
              Rol: Asistente de Operaciones Comerciales (Marketing)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Gestor de Campañas & Promociones de Ventas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Crea solicitudes de campañas de marketing con productos o servicios del catálogo, asigna descuentos, fotos de referencia (o Google Drive) y fecha de vigencia para revisión del Jefe de Ventas y Operaciones.
            </p>
          </div>
          <div className="bg-white  p-4 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
            <p className="font-bold text-slate-900">Flujo de Campaña Comercial:</p>
            <p>1. Asistente crea solicitud con foto</p>
            <p>2. Jefe de Ventas revisa y aprueba</p>
            <p>3. Se publica en el Portal Web de Clientes</p>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación del Asistente Comercial */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveMktTab("campaigns")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeMktTab === "campaigns"
              ? "bg-brand-700 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Campañas & Promociones
        </button>

        <button
          onClick={() => setActiveMktTab("enrichment")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeMktTab === "enrichment"
              ? "bg-brand-700 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Catálogo & Imágenes Obligatorias
        </button>

        <button
          onClick={() => setActiveMktTab("reviews")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeMktTab === "reviews"
              ? "bg-brand-700 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Reseñas & Críticas de Clientes
        </button>
      </div>

      {activeMktTab === "enrichment" && <OperationalCatalogEnricher />}

      {activeMktTab === "reviews" && <ReviewsAnalyticsView />}

      {activeMktTab === "campaigns" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario de Campaña (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Nueva Solicitud de Promoción de Ventas
            </h2>
            <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded">
              Pasa a Jefatura de Ventas
            </span>
          </div>

          <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
            {/* Título de la Campaña */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Título Comercial de la Campaña *
              </label>
              <input
                type="text"
                placeholder="Ej: Revisión de lavadora + limpieza de componentes con 30% de descuento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Descripción Promocional *
              </label>
              <textarea
                rows={2}
                placeholder="Detalle el beneficio, condiciones o piezas incluidas en la promoción..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
              />
            </div>

            {/* Desplegable / Selector de Productos y Servicios disponibles */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex justify-between">
                <span>Productos y Servicios en Promoción (Desplegable) *</span>
                <span className="text-purple-600 font-bold">{selectedItemIds.length} seleccionados</span>
              </label>
              <div className="border border-slate-300 rounded-lg p-2 max-h-40 overflow-y-auto space-y-1 bg-slate-50">
                {allItems.map((it) => {
                  const isChecked = selectedItemIds.includes(it.id);
                  return (
                    <label
                      key={it.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition ${
                        isChecked ? "bg-purple-100/70 border border-purple-200" : "hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItemSelection(it.id)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-semibold text-slate-800">
                          [{it.code}] {it.name}
                        </span>
                      </div>
                      <span className="font-mono text-slate-600 font-bold">
                        {formatPrice(it.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Precios, Descuento y Fecha Límite */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descuento (%) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="80"
                    value={discountPercent}
                    onChange={(e) => {
                      const disc = Number(e.target.value);
                      setDiscountPercent(disc);
                      setPromoPrice(Math.round(regularPrice * (1 - disc / 100)));
                    }}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Precio Promo (CLP) *
                </label>
                <input
                  type="number"
                  step="1000"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(Number(e.target.value))}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-bold text-purple-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fecha Límite Campaña *
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                />
              </div>
            </div>

            {/* Foto de Referencia de la Promoción */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Foto de Referencia de la Promoción (URL o Google Drive) *
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/... o https://images.unsplash.com/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                El sistema transformará los enlaces compartidos de Google Drive automáticamente a CDN de alta resolución.
              </p>
            </div>

            {/* Botón Enviar Solicitud */}
            <button
              type="submit"
              className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Enviar Solicitud de Promoción al Jefe de Ventas
            </button>
          </form>
        </div>

        {/* Previsualización de la Tarjeta Promocional (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              Previsualización de la Campaña en el Portal
            </h3>
            <span className="text-[11px] text-slate-500">Vista previa en vivo</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
              <img
                src={directPhotoUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute top-3 left-3 bg-brand-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
                {discountPercent}% OFF
              </div>
              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                Válido hasta {new Date(validUntil + "T00:00:00").toLocaleDateString("es-CL")}
              </div>
            </div>

            <div className="p-5 space-y-2">
              <h4 className="text-base font-bold text-slate-900 leading-snug">{title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{description}</p>
              
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-bold text-purple-700">
                  {formatPrice(promoPrice)}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(regularPrice)}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500">
                <strong>Ítems combinados:</strong>{" "}
                {allItems.filter((i) => selectedItemIds.includes(i.id)).map((i) => i.name).join(", ") || "Ninguno"}
              </div>
            </div>
          </div>

          {/* Historial de Solicitudes */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Historial de Campañas Solicitadas
            </h4>
            <div className="space-y-2">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold text-slate-900 truncate">{c.title}</p>
                    <p className="text-[10px] text-slate-500">
                      Hasta {c.validUntil} · {formatPrice(c.promoPrice)}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    c.status === "APROBADA"
                      ? "bg-emerald-100 text-emerald-800"
                      : c.status === "RECHAZADA"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
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


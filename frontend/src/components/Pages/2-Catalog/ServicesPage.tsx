import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useCommercial } from "@/contexts/CommercialContext";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { PageShell, Container } from "@/components/Pages/2-Catalog/PageShell";
import { CatalogLayout } from "@/components/Pages/2-Catalog/CatalogLayout";
import { SectionHeader } from "@/components/Pages/2-Catalog/SectionHeader";
import { CatalogGrid } from "@/components/Pages/2-Catalog/CatalogGrid";
import { FilterSidebar, FilterGroup } from "@/components/Pages/2-Catalog/filters/FilterSidebar";
import { CategoryFilter } from "@/components/Pages/2-Catalog/filters/CategoryFilter";
import { PriceFilter } from "@/components/Pages/2-Catalog/filters/PriceFilter";

interface ServicesPageProps {
  searchQuery: string;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  searchQuery,
  selectedCategory,
  onSelectCategory,
}) => {
  const { addToCart } = useCart();
  const { services, serviceCategories } = useCatalog();
  const { reviews, addReview } = useCommercial();
  const filters = useCatalogFilters({ items: services, searchQuery, category: selectedCategory });

  // Modal para dejar reseña cliente
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientCommune, setClientCommune] = useState("Maipú");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0]?.id || 2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !comment.trim()) return;

    const srv = services.find((s) => s.id === selectedServiceId) || services[0];
    addReview({
      serviceOrProductId: srv.id,
      targetName: srv.name,
      clientName: clientName.trim(),
      clientCommune,
      rating,
      comment: comment.trim(),
      category: rating >= 4 ? "FELICITACION" : rating === 3 ? "MEJORA" : "CRITICA",
      verifiedPurchase: true,
    });

    setReviewModalOpen(false);
    setClientName("");
    setComment("");
    setToastMessage("¡Gracias por tu opinión! Tu reseña ha sido registrada en el sistema.");
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <PageShell>
      <Container className="py-8 space-y-12">
        <CatalogLayout
          sidebar={
            <FilterSidebar>
              <CategoryFilter
                categories={["Todos", ...serviceCategories]}
                selected={selectedCategory}
                onSelect={onSelectCategory}
              />
              <PriceFilter
                value={filters.priceRange}
                max={filters.maxPrice}
                step={filters.priceStep}
                onChange={filters.setPriceRange}
              />
              <FilterGroup title="Cotizaciones formales">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para condominios, colegios y empresas emitimos cotizaciones membretadas SEC con validez de 15 días.
                </p>
              </FilterGroup>
            </FilterSidebar>
          }
        >
          <SectionHeader
            title={selectedCategory === "Todos" ? "Servicios eléctricos" : selectedCategory}
            meta={`${filters.filtered.length} resultados`}
            note="Valores netos en CLP"
          />
          <CatalogGrid
            items={filters.filtered}
            actionLabel="Solicitar"
            onAction={addToCart}
            emptyMessage="No se encontraron servicios para el filtro seleccionado."
          />
        </CatalogLayout>

        {/* SECCIÓN DE RESEÑAS Y OPINIONES DE CLIENTES (Req: Sección de reseñas para los clientes) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block">
                Transparencia & Estándar SEC
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Opiniones y Reseñas Verificadas de Clientes
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Conoce las experiencias reales de condominios, PyMEs y particulares atendidos por nuestras cuadrillas.
              </p>
            </div>

            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
            >
              Dejar mi Opinión / Calificar Servicio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.slice(0, 4).map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{rev.clientName}</strong>
                    <span className="text-slate-400 text-[11px]">({rev.clientCommune})</span>
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] text-emerald-700 font-bold">Verificado</span>
                    )}
                  </div>
                  <div className="text-amber-500 font-bold">
                    {rev.rating} / 5
                  </div>
                </div>
                <p className="font-semibold text-blue-700 text-[11px]">
                  Servicio: {rev.targetName}
                </p>
                <p className="text-slate-600 italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* Modal para Dejar Reseña */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Califica tu Servicio Eléctrico
            </h3>
            <p className="text-xs text-slate-500">
              Tu opinión nos ayuda a mejorar y auditar la calidad de nuestras cuadrillas en terreno.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tu Nombre o Empresa *</label>
                <input
                  type="text"
                  placeholder="Ej: Marcelo Díaz / Constructora Maipú"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Comuna donde se realizó el servicio *</label>
                <input
                  type="text"
                  placeholder="Ej: Maipú, Santiago, Las Condes"
                  value={clientCommune}
                  onChange={(e) => setClientCommune(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Servicio Contratado *</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calificación (1 a 5) *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-colors ${star <= rating ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Comentario u Oportunidad de Mejora *</label>
                <textarea
                  rows={3}
                  placeholder="Comenta sobre la puntualidad, profesionalismo técnico y solución entregada..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Enviar Reseña
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
    </PageShell>
  );
};

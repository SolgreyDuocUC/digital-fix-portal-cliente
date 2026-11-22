import React, { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useCommercial } from "@/contexts/CommercialContext";
import { pickFeatured, uniqueBrands } from "@/utils/catalog";
import { formatPrice } from "@/utils/currency";
import { CatalogView, QuickCategory } from "@/types/catalog";
import { HOME_HERO, HOME_BENEFITS } from "@/mocks/home";
import { PageShell, Container } from "@/components/Pages/2-Catalog/PageShell";
import { HeroBanner } from "@/components/Pages/2-Catalog/HeroBanner";
import { CategoryShortcuts } from "@/components/Pages/2-Catalog/CategoryShortcuts";
import { SectionHeader } from "@/components/Pages/2-Catalog/SectionHeader";
import { CatalogGrid } from "@/components/Pages/2-Catalog/CatalogGrid";
import { BrandChips } from "@/components/Pages/2-Catalog/BrandChips";
import { BenefitsStrip } from "@/components/Pages/2-Catalog/BenefitsStrip";

interface HomePageProps {
  onNavigate: (view: Exclude<CatalogView, "home">, category?: string) => void;
  onOpenOrderTracking: () => void;
}

const FEATURED_COUNT = 4;
const FEATURED_COLUMNS = "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenOrderTracking }) => {
  const { addToCart } = useCart();
  const { services, products, serviceCategories } = useCatalog();
  const { campaigns } = useCommercial();

  const featuredServices = useMemo(() => pickFeatured(services, FEATURED_COUNT), [services]);
  const featuredProducts = useMemo(() => pickFeatured(products, FEATURED_COUNT), [products]);
  const brands = useMemo(() => uniqueBrands(products), [products]);

  // Accesos rápidos según lo que realmente hay en el catálogo.
  const quickCategories = useMemo<QuickCategory[]>(
    () => [
      ...serviceCategories.slice(0, 4).map((c) => {
        const n = services.filter((s) => s.category === c).length;
        return { name: c, label: c, subtitle: n === 1 ? "1 servicio" : `${n} servicios`, target: "services" as const };
      }),
      ...(products.length > 0
        ? [{ name: "Repuestos", label: "Repuestos", subtitle: `${products.length} productos`, target: "products" as const }]
        : []),
    ],
    [serviceCategories, services, products]
  );

  // Campaña destacada aprobada por Jefatura de Ventas
  const activeCampaign = campaigns.find((c) => c.status === "APROBADA");

  const handleShortcut = (c: QuickCategory) =>
    onNavigate(c.target, c.target === "services" ? c.name : undefined);

  return (
    <PageShell>
      <HeroBanner
        {...HOME_HERO}
        primaryAction={{ label: "Solicitar cuadrilla", onClick: () => onNavigate("services", "Todos") }}
        secondaryAction={{ label: "Ver mis órdenes", onClick: onOpenOrderTracking, icon: "truck" }}
      />

      {quickCategories.length > 0 && (
        <Container className="-mt-10 sm:-mt-12 relative z-10">
          <CategoryShortcuts categories={quickCategories} onSelect={handleShortcut} />
        </Container>
      )}

      <Container className="py-8 space-y-10">
        {/* Banner de Campaña de Marketing Aprobada por Jefatura */}
        {activeCampaign && (
          <section className="panel border-brand-200 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 badge bg-brand-50 text-brand-600 border border-brand-200">
                Promoción · {activeCampaign.discountPercentage}% OFF
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {activeCampaign.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {activeCampaign.description}
              </p>
              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-bold text-brand-600">
                  {formatPrice(activeCampaign.promoPrice)}
                </span>
                <span className="text-xs text-slate-500 line-through">
                  {formatPrice(activeCampaign.regularPrice)}
                </span>
                <span className="text-[11px] text-slate-600">
                  Válido hasta {new Date(activeCampaign.validUntil + "T00:00:00").toLocaleDateString("es-CL")}
                </span>
              </div>
            </div>

            <div>
              <button
                onClick={() => onNavigate("services")}
                className="btn-primary"
              >
                Aprovechar Promoción
              </button>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <SectionHeader
            title="Servicios destacados"
            actionLabel="Ver todos los servicios"
            onAction={() => onNavigate("services")}
          />
          <CatalogGrid
            items={featuredServices}
            actionLabel="Solicitar"
            onAction={addToCart}
            columnsClassName={FEATURED_COLUMNS}
          />
        </section>

        <section className="space-y-4">
          <SectionHeader
            title="Productos destacados"
            actionLabel="Ver todos los productos"
            onAction={() => onNavigate("products")}
          />
          <CatalogGrid
            items={featuredProducts}
            actionLabel="Agregar al carrito"
            onAction={addToCart}
            columnsClassName={FEATURED_COLUMNS}
          />
        </section>

        {brands.length > 0 && <BrandChips brands={brands} />}
        <BenefitsStrip items={HOME_BENEFITS} />
      </Container>
    </PageShell>
  );
};

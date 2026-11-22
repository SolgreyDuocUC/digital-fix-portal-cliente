import React, { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/hooks/useCatalog";
import { pickFeatured } from "@/utils/catalog";
import { CatalogView, QuickCategory } from "@/types/catalog";
import { HOME_HERO, HOME_BENEFITS } from "@/mocks/home";
import { QUICK_CATEGORIES } from "@/mocks/categorias";
import { BRANDS } from "@/mocks/marcas";
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
  const { services, products } = useCatalog();

  const featuredServices = useMemo(() => pickFeatured(services, FEATURED_COUNT), [services]);
  const featuredProducts = useMemo(() => pickFeatured(products, FEATURED_COUNT), [products]);

  const handleShortcut = (c: QuickCategory) =>
    onNavigate(c.target, c.target === "services" ? c.name : undefined);

  return (
    <PageShell>
      <HeroBanner
        {...HOME_HERO}
        primaryAction={{ label: "Solicitar cuadrilla", onClick: () => onNavigate("services", "Emergencias") }}
        secondaryAction={{ label: "Ver mis órdenes", onClick: onOpenOrderTracking, icon: "truck" }}
      />

      <Container className="-mt-10 sm:-mt-12 relative z-10">
        <CategoryShortcuts categories={QUICK_CATEGORIES} onSelect={handleShortcut} />
      </Container>

      <Container className="py-8 space-y-10">
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

        <BrandChips brands={BRANDS} />
        <BenefitsStrip items={HOME_BENEFITS} />
      </Container>
    </PageShell>
  );
};

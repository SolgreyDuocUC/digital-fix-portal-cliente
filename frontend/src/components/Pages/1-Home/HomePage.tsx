import React, { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useCommercial } from "@/contexts/CommercialContext";
import { pickFeatured, uniqueBrands } from "@/utils/catalog";
import { formatPrice } from "@/utils/currency";
import { CatalogView, QuickCategory } from "@/types/catalog";
import { HOME_HERO, HOME_BENEFITS } from "@/mocks/home";
import { PageShell } from "@/components/Pages/2-Catalog/PageShell";
import { HeroBanner } from "@/components/Pages/2-Catalog/HeroBanner";
import { CategoryShortcuts } from "@/components/Pages/2-Catalog/CategoryShortcuts";
import { SectionHeader } from "@/components/Pages/2-Catalog/SectionHeader";
import { CatalogGrid } from "@/components/Pages/2-Catalog/CatalogGrid";
import { BrandChips } from "@/components/Pages/2-Catalog/BrandChips";
import { BenefitsStrip } from "@/components/Pages/2-Catalog/BenefitsStrip";
import { PromoCarousel, CarouselSlide } from "@/components/Pages/2-Catalog/PromoCarousel";

interface HomePageProps {
  onNavigate: (view: Exclude<CatalogView, "home">, category?: string) => void;
  onOpenOrderTracking: () => void;
}

const FEATURED_COUNT = 4;
const FEATURED_COLUMNS = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6";

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenOrderTracking }) => {
  const { addToCart } = useCart();
  const { services, products, serviceCategories } = useCatalog();
  const { campaigns } = useCommercial();

  const featuredServices = useMemo(() => pickFeatured(services, FEATURED_COUNT), [services]);
  const featuredProducts = useMemo(() => pickFeatured(products, FEATURED_COUNT), [products]);
  const brands = useMemo(() => uniqueBrands(products), [products]);

  const quickCategories = useMemo<QuickCategory[]>(
    () => [
      ...serviceCategories.slice(0, 4).map((c) => {
        const n = services.filter((s) => s.category === c).length;
        return {
          name: c,
          label: c,
          subtitle: n === 1 ? "1 servicio disponible" : `${n} servicios disponibles`,
          target: "services" as const,
        };
      }),
      ...(products.length > 0
        ? [
            {
              name: "Repuestos",
              label: "Repuestos",
              subtitle: `${products.length} en catálogo`,
              target: "products" as const,
            },
          ]
        : []),
    ],
    [serviceCategories, services, products]
  );

  const activeCampaign = campaigns.find((c) => c.status === "APROBADA");

  // =========================================================================
  // SLIDES DEL CARRUSEL: Pega aquí los links de imágenes que te pase Marketing
  // =========================================================================
  const carouselSlides = useMemo<CarouselSlide[]>(() => {
    const slides: CarouselSlide[] = [];

    // 1. Si hay una campaña aprobada por Jefatura, aparece primero automáticamente
    if (activeCampaign) {
      slides.push({
        id: `campaign-${activeCampaign.id}`,
        badge: `Oferta Especial · -${activeCampaign.discountPercentage}% OFF`,
        title: `${activeCampaign.title} por ${formatPrice(activeCampaign.promoPrice)}`,
        subtitle: `${activeCampaign.description} (Antes ${formatPrice(activeCampaign.regularPrice)}).`,
        imageUrl: "", // <-- Opcional: pega aquí link de imagen para campañas aprobadas
        ctaLabel: "Aprovechar oferta",
        onAction: () => onNavigate("services"),
      });
    }

    // 2. Banners fijos de Marketing (reemplaza los imageUrl con los links reales)
    slides.push(
      {
        id: "slide-mantencion",
        badge: "Prevención Hogar y Empresas",
        title: "Mantención eléctrica certificada SEC",
        subtitle:
          "Evita cortes y fallas críticas con revisión completa de tableros, protecciones y puesta a tierra.",
        imageUrl: "", // <-- PEGA AQUÍ EL LINK DE IMAGEN 1 (ej. "https://.../banner-1.jpg")
        mobileImageUrl: "", // <-- Opcional: link versión móvil
        ctaLabel: "Agendar mantención",
        onAction: () => onNavigate("services", "Todos"),
      },
      {
        id: "slide-repuestos",
        badge: "Stock Inmediato",
        title: "Repuestos originales y equipamiento profesional",
        subtitle:
          "Despacho rápido o retiro coordinado con garantía escrita de 6 meses en toda la línea.",
        imageUrl: "", // <-- PEGA AQUÍ EL LINK DE IMAGEN 2 (ej. "https://.../banner-2.jpg")
        ctaLabel: "Ver repuestos",
        onAction: () => onNavigate("products"),
      },
      {
        id: "slide-emergencias",
        badge: "Atención 24/7",
        title: "Cuadrillas técnicas en terreno todo el año",
        subtitle:
          "Diagnóstico rápido y solución definitiva para emergencias domiciliarias y comerciales.",
        imageUrl: "", // <-- PEGA AQUÍ EL LINK DE IMAGEN 3 (ej. "https://.../banner-3.jpg")
        ctaLabel: "Solicitar cuadrilla",
        onAction: () => onNavigate("services", "Todos"),
      }
    );

    return slides;
  }, [activeCampaign, onNavigate]);

  const handleShortcut = (c: QuickCategory) =>
    onNavigate(c.target, c.target === "services" ? c.name : undefined);

  return (
    <PageShell>
      {/* Hero principal */}
      <HeroBanner
        {...HOME_HERO}
        primaryAction={{
          label: "Solicitar cuadrilla",
          onClick: () => onNavigate("services", "Todos"),
        }}
        secondaryAction={{
          label: "Ver mis órdenes",
          onClick: onOpenOrderTracking,
        }}
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Accesos rápidos */}
        {quickCategories.length > 0 && (
          <div className="mt-5 sm:-mt-10 lg:-mt-12 relative z-10">
            <CategoryShortcuts categories={quickCategories} onSelect={handleShortcut} />
          </div>
        )}

        <div className="py-8 sm:py-12 lg:py-14 space-y-12 lg:space-y-16">
          {/* Carrusel de Marketing a ancho completo */}
          <PromoCarousel slides={carouselSlides} />

          {/* Servicios destacados */}
          <section className="space-y-5">
            <SectionHeader
              title="Servicios técnicos destacados"
              actionLabel="Explorar todos los servicios"
              onAction={() => onNavigate("services")}
            />
            <CatalogGrid
              items={featuredServices}
              actionLabel="Solicitar servicio"
              onAction={addToCart}
              columnsClassName={FEATURED_COLUMNS}
            />
          </section>

          {/* Productos / Repuestos destacados */}
          <section className="space-y-5">
            <SectionHeader
              title="Repuestos y equipamiento"
              actionLabel="Ver catálogo completo"
              onAction={() => onNavigate("products")}
            />
            <CatalogGrid
              items={featuredProducts}
              actionLabel="Agregar al carrito"
              onAction={addToCart}
              columnsClassName={FEATURED_COLUMNS}
            />
          </section>

          {/* Marcas y Garantías */}
          <div className="space-y-8 pt-2">
            {brands.length > 0 && <BrandChips brands={brands} />}
            <BenefitsStrip items={HOME_BENEFITS} />
          </div>

          {/* Cierre de conversión */}
          <section className="panel p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white to-brand-50/70 border-brand-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <span className="eyebrow text-brand-600">Atención inmediata en terreno</span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                ¿Necesitas una evaluación técnica urgente?
              </h3>
              <p className="text-sm text-slate-600">
                Nuestras cuadrillas certificadas atienden emergencias 24/7 con garantía escrita de 6 meses en mano de obra y repuestos.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 shrink-0">
              <a
                href="tel:+56987654321"
                className="btn-secondary w-full sm:w-auto h-11 px-5 text-sm"
              >
                Llamar: +56 9 8765 4321
              </a>
              <button
                onClick={() => onNavigate("services", "Todos")}
                className="btn-primary w-full sm:w-auto h-11 px-6 text-sm"
              >
                Agendar visita ahora
              </button>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
};
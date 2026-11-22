import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { SERVICE_CATEGORIES } from "@/mocks/categorias";
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
  const { services } = useCatalog();
  const filters = useCatalogFilters({ items: services, searchQuery, category: selectedCategory });

  return (
    <PageShell>
      <Container className="py-8">
        <CatalogLayout
          sidebar={
            <FilterSidebar>
              <CategoryFilter
                categories={SERVICE_CATEGORIES}
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
                  Para condominios y plantas industriales emitimos presupuestos con validez de 15 días.
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
      </Container>
    </PageShell>
  );
};

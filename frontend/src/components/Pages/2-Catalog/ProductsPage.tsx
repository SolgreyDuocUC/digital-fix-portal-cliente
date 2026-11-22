import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { BRANDS } from "@/mocks/marcas";
import { PageShell, Container } from "@/components/Pages/2-Catalog/PageShell";
import { CatalogLayout } from "@/components/Pages/2-Catalog/CatalogLayout";
import { SectionHeader } from "@/components/Pages/2-Catalog/SectionHeader";
import { CatalogGrid } from "@/components/Pages/2-Catalog/CatalogGrid";
import { BrandChips } from "@/components/Pages/2-Catalog/BrandChips";
import { FilterSidebar } from "@/components/Pages/2-Catalog/filters/FilterSidebar";
import { PriceFilter } from "@/components/Pages/2-Catalog/filters/PriceFilter";
import { StockFilter } from "@/components/Pages/2-Catalog/filters/StockFilter";

interface ProductsPageProps {
  searchQuery: string;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ searchQuery }) => {
  const { addToCart } = useCart();
  const { products } = useCatalog();
  const filters = useCatalogFilters({ items: products, searchQuery });

  return (
    <PageShell>
      <Container className="py-8 space-y-6">
        <BrandChips brands={BRANDS} />

        <CatalogLayout
          sidebar={
            <FilterSidebar>
              <PriceFilter
                value={filters.priceRange}
                max={filters.maxPrice}
                step={filters.priceStep}
                onChange={filters.setPriceRange}
              />
              <StockFilter
                checked={filters.onlyStock}
                onChange={filters.setOnlyStock}
                label="Solo repuestos en stock"
              />
            </FilterSidebar>
          }
        >
          <SectionHeader
            title="Repuestos y materiales"
            meta={`${filters.filtered.length} resultados`}
            note="Valores netos en CLP"
          />
          <CatalogGrid
            items={filters.filtered}
            actionLabel="Agregar al carrito"
            onAction={addToCart}
            emptyMessage="No se encontraron productos para el filtro seleccionado."
          />
        </CatalogLayout>
      </Container>
    </PageShell>
  );
};

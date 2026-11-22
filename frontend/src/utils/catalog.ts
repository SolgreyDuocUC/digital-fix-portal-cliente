import { ElectricalProduct } from "@/types/product";

/** Todo lo que está en esta categoría es un producto físico; el resto son servicios. */
export const PRODUCT_CATEGORY = "Repuestos";

export const isProduct = (item: ElectricalProduct): boolean =>
  item.category === PRODUCT_CATEGORY;

export const isService = (item: ElectricalProduct): boolean => !isProduct(item);

export const discountOf = (price: number, original?: number): number =>
  original && original > price ? Math.round((1 - price / original) * 100) : 0;

export const matchesSearch = (item: ElectricalProduct, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.name, item.description, item.code].some((field) =>
    field.toLowerCase().includes(q)
  );
};

/** Criterio temporal de "destacados": mayor descuento primero. */
export const pickFeatured = (
  items: ElectricalProduct[],
  count: number
): ElectricalProduct[] =>
  [...items]
    .sort(
      (a, b) =>
        discountOf(b.price, b.originalPrice) - discountOf(a.price, a.originalPrice)
    )
    .slice(0, count);

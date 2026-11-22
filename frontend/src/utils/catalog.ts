import { ElectricalProduct } from "@/types/product";

/** Sección de tienda que agrupa los repuestos (productos físicos de ms-catalog). */
export const PRODUCT_CATEGORY = "Repuestos";

export const isProduct = (item: ElectricalProduct): boolean => item.kind === "REPUESTO";

export const isService = (item: ElectricalProduct): boolean => !isProduct(item);

export const discountOf = (price: number, original?: number): number =>
  original && original > price ? Math.round((1 - price / original) * 100) : 0;

export const matchesSearch = (item: ElectricalProduct, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.name, item.description, item.code, item.brand ?? ""].some((field) =>
    field.toLowerCase().includes(q)
  );
};

/** Destacados: primero los que marca Marketing, luego los de mayor descuento. */
export const pickFeatured = (
  items: ElectricalProduct[],
  count: number
): ElectricalProduct[] =>
  [...items]
    .sort(
      (a, b) =>
        Number(!!b.featured) - Number(!!a.featured) ||
        discountOf(b.price, b.originalPrice) - discountOf(a.price, a.originalPrice)
    )
    .slice(0, count);

/** Marcas presentes en los repuestos, sin repetir. */
export const uniqueBrands = (items: ElectricalProduct[]): string[] =>
  Array.from(new Set(items.map((i) => i.brand?.trim()).filter((b): b is string => !!b))).sort((a, b) =>
    a.localeCompare(b, "es")
  );

import { useMemo, useState } from "react";
import { ElectricalProduct } from "@/types/product";
import { matchesSearch } from "@/utils/catalog";

interface Options {
  items: ElectricalProduct[];
  searchQuery: string;
  category?: string;
}

export const useCatalogFilters = ({ items, searchQuery, category = "Todos" }: Options) => {
  const maxPrice = useMemo(
    () => Math.ceil(Math.max(10000, ...items.map((i) => i.price)) / 10000) * 10000,
    [items]
  );
  const priceStep = maxPrice >= 100000 ? 5000 : 1000;

  const [limit, setLimit] = useState<number | null>(null);
  const [onlyStock, setOnlyStock] = useState(false);
  const priceRange = limit ?? maxPrice;

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === "Todos" || item.category === category) &&
          matchesSearch(item, searchQuery) &&
          item.price <= priceRange &&
          (!onlyStock || (item.stock ?? 0) > 0)
      ),
    [items, category, searchQuery, priceRange, onlyStock]
  );

  return {
    filtered,
    maxPrice,
    priceStep,
    priceRange,
    setPriceRange: setLimit,
    onlyStock,
    setOnlyStock,
  };
};

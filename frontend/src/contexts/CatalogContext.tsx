import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ElectricalProduct } from "@/types/product";
import { isProduct, isService } from "@/utils/catalog";
import { fetchCatalog } from "@/services/catalogService";
import { errorMessage } from "@/services/api";

interface CatalogContextType {
  items: ElectricalProduct[];
  services: ElectricalProduct[];
  products: ElectricalProduct[];
  /** Categorías de servicios presentes en el catálogo, en orden de aparición. */
  serviceCategories: string[];
  loading: boolean;
  /** Mensaje si una sección (o todo el catálogo) no se pudo cargar. */
  error: string | null;
  reload: () => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

/** Catálogo de la tienda desde el backend del portal; se carga una vez y lo comparten todas las vistas. */
export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ElectricalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetchCatalog(ctrl.signal)
      .then(({ items: data, errors }) => {
        setItems(data);
        setError(
          errors.length === 0
            ? null
            : errors.length === 2
              ? "No pudimos cargar el catálogo. Inténtalo nuevamente en unos minutos."
              : `Por ahora no pudimos cargar los ${errors[0]}; el resto del catálogo está disponible.`
        );
      })
      .catch((err) => {
        if ((err as Error)?.name !== "AbortError") setError(errorMessage(err));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo(() => {
    const services = items.filter(isService);
    const products = items.filter(isProduct);
    const serviceCategories = Array.from(new Set(services.map((s) => s.category)));
    return { items, services, products, serviceCategories, loading, error, reload };
  }, [items, loading, error, reload]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalogContext = (): CatalogContextType => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog debe usarse dentro de un CatalogProvider");
  }
  return context;
};

import { useState, useEffect, useMemo } from "react";
import { ElectricalProduct } from "@/types/product";
import { ELECTRICAL_CATALOG } from "@/mocks/catalogo";
import { isProduct, isService } from "@/utils/catalog";
import { fetchCatalogProducts } from "@/services/catalogService";

/**
 * Fuente reactiva de datos del catálogo.
 * Consulta ms-catalog en tiempo real e integra los servicios eléctricos base,
 * con fallback instantáneo al catálogo local en caso de desconexión.
 */
export const useCatalog = () => {
  const [items, setItems] = useState<ElectricalProduct[]>(ELECTRICAL_CATALOG);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchCatalogProducts()
      .then((data) => {
        if (isMounted) setItems(data);
      })
      .catch((err) => {
        console.warn("No se pudo sincronizar catálogo con backend; usando datos locales:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const services = useMemo(() => items.filter(isService), [items]);
  const products = useMemo(() => items.filter(isProduct), [items]);

  return {
    items,
    services,
    products,
    loading,
  };
};
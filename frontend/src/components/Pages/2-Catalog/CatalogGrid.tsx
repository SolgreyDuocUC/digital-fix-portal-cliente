import React from "react";
import { ElectricalProduct, itemKey } from "@/types/product";
import { useCatalog } from "@/hooks/useCatalog";
import { CatalogCard } from "./CatalogCard";

interface CatalogGridProps {
  items: ElectricalProduct[];
  actionLabel: string;
  onAction: (item: ElectricalProduct) => void;
  emptyMessage?: string;
  columnsClassName?: string;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  items,
  actionLabel,
  onAction,
  emptyMessage = "No se encontraron resultados para el filtro seleccionado.",
  columnsClassName = "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
}) => {
  const { loading, error, reload } = useCatalog();

  if (items.length === 0) {
    return (
      <div className="panel p-10 text-center text-sm text-slate-500">
        {loading ? (
          "Cargando catálogo..."
        ) : error ? (
          <>
            <p className="text-slate-700">{error}</p>
            <button onClick={reload} className="btn-secondary mt-4">
              Reintentar
            </button>
          </>
        ) : (
          emptyMessage
        )}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${columnsClassName}`}>
      {items.map((item) => (
        <CatalogCard key={itemKey(item)} item={item} actionLabel={actionLabel} onAction={onAction} />
      ))}
    </div>
  );
};

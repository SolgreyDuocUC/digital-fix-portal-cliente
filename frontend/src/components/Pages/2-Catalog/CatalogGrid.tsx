import React from "react";
import { ElectricalProduct } from "@/types/product";
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
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg p-10 text-center shadow-sm text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${columnsClassName}`}>
      {items.map((item) => (
        <CatalogCard key={item.id} item={item} actionLabel={actionLabel} onAction={onAction} />
      ))}
    </div>
  );
};

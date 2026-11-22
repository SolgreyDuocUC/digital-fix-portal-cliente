import React from "react";
import { ElectricalProduct } from "@/types/product";
import { formatPrice } from "@/utils/currency";
import { discountOf } from "@/utils/catalog";
import { ImageSlot } from "./ImageSlot";

interface CatalogCardProps {
  item: ElectricalProduct;
  actionLabel: string;
  onAction: (item: ElectricalProduct) => void;
  imageSrc?: string;
}

/** Tarjeta única para servicios y repuestos: imagen, datos clave en filas y una sola acción. */
export const CatalogCard: React.FC<CatalogCardProps> = ({ item, actionLabel, onAction, imageSrc }) => {
  const discount = discountOf(item.price, item.originalPrice);
  const effectiveImage = imageSrc || item.imageUrl;

  return (
    <article className="panel overflow-hidden flex flex-col transition-colors hover:border-brand-300">
      {/* Solo con foto real (Marketing la vincula desde Google Drive); sin foto no se dibuja relleno. */}
      {effectiveImage && (
        <ImageSlot src={effectiveImage} alt={item.name} className="aspect-[4/3] border-b border-slate-200" />
      )}

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-500 tabular-nums">{item.code}</span>
          {item.highlightBadge && (
            <span className="badge bg-brand-50 text-brand-600 border border-brand-100">{item.highlightBadge}</span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{item.name}</h3>
        <p className="text-xs text-slate-500 leading-normal line-clamp-2">{item.description}</p>

        <div className="mt-1">
          {item.originalPrice && discount > 0 && (
            <span className="text-xs text-slate-400 line-through mr-2 tabular-nums">{formatPrice(item.originalPrice)}</span>
          )}
          <div className="flex items-baseline gap-2">
            <strong className="text-xl font-bold text-slate-900 tabular-nums">{formatPrice(item.price)}</strong>
            {discount > 0 && <span className="badge bg-brand-50 text-brand-600">{discount}% menos</span>}
          </div>
        </div>

        <dl className="text-xs divide-y divide-slate-100 border-t border-slate-100 mt-1">
          {item.brand && (
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Marca</dt>
              <dd className="font-medium text-slate-800">{item.brand}</dd>
            </div>
          )}
          {item.responseTime && (
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Tiempo estimado</dt>
              <dd className="font-medium text-slate-800">{item.responseTime}</dd>
            </div>
          )}
          {item.warrantyMonths && (
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Garantía</dt>
              <dd className="font-medium text-slate-800">{item.warrantyMonths} meses</dd>
            </div>
          )}
          {item.secCertified && (
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Certificación</dt>
              <dd className="font-medium text-slate-800">SEC</dd>
            </div>
          )}
          {item.stock !== undefined && (
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Stock</dt>
              <dd className={`font-medium tabular-nums ${item.stock > 0 ? "text-slate-800" : "text-red-600"}`}>
                {item.stock > 0 ? `${item.stock} ${item.stock === 1 ? "unidad" : "unidades"}` : "Sin stock"}
              </dd>
            </div>
          )}
          {item.freeDispatch && (
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Despacho</dt>
              <dd className="font-medium text-slate-800">Sin costo</dd>
            </div>
          )}
        </dl>

        <div className="mt-auto pt-2">
          <button
            onClick={() => onAction(item)}
            disabled={item.kind === "REPUESTO" && (item.stock ?? 0) <= 0}
            className="btn-secondary w-full hover:border-brand-600 hover:text-brand-600"
          >
            {item.kind === "REPUESTO" && (item.stock ?? 0) <= 0 ? "Sin stock" : actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
};

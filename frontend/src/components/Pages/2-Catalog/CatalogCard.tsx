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

/** Tarjeta única para servicios y productos: no conoce el carrito, solo avisa que se pulsó la acción. */
export const CatalogCard: React.FC<CatalogCardProps> = ({
  item,
  actionLabel,
  onAction,
  imageSrc,
}) => {
  const discount = discountOf(item.price, item.originalPrice);

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <ImageSlot src={imageSrc} alt={item.name} className="aspect-[4/3] border-b border-sky-100" />

      <div className="p-4 flex flex-col flex-1 gap-1.5">
        {item.highlightBadge && (
          <span className="self-start text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            {item.highlightBadge}
          </span>
        )}

        <h3 className="text-sm text-slate-800 leading-snug line-clamp-2">{item.name}</h3>
        <p className="text-xs text-slate-500 leading-normal line-clamp-2">{item.description}</p>

        <div className="mt-1">
          {item.originalPrice && (
            <span className="text-xs text-slate-400 line-through block">
              {formatPrice(item.originalPrice)}
            </span>
          )}
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-normal text-slate-900">
              {formatPrice(item.price)}
            </strong>
            {discount > 0 && (
              <span className="text-xs font-semibold text-emerald-600">{discount}% OFF</span>
            )}
          </div>
        </div>

        <div className="text-xs space-y-0.5">
          {item.freeDispatch && (
            <p className="text-emerald-600 font-semibold">Envío gratis</p>
          )}
          <p className="text-slate-500">{item.responseTime}</p>
          <p className="text-slate-500">Garantía: {item.warrantyMonths} meses</p>
          {item.stock !== undefined && (
            <p className="text-slate-500">{item.stock} disponibles</p>
          )}
        </div>

        <div className="mt-auto pt-3">
          <button
            onClick={() => onAction(item)}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm py-2.5 rounded-md transition"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
};

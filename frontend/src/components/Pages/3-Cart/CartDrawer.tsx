import React from "react";
import { useCart } from "../../../contexts/CartContext";
import { itemKey } from "../../../types/product";
import { formatPrice } from "../../../utils/currency";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedCheckout }) => {
  const { cart, cartCount, subtotal, updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 z-50 animate-fadeIn" onClick={onClose} />

      <aside
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-xl flex flex-col border-l border-slate-200 animate-slideInRight"
        aria-label="Carrito"
      >
        <div className="px-6 h-16 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Carrito</h2>
            <p className="text-xs text-slate-500">
              {cartCount === 1 ? "1 ítem" : `${cartCount} ítems`}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar carrito" className="btn-ghost">
            Cerrar
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-slate-800">Tu carrito está vacío</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Agrega servicios técnicos en terreno o repuestos del catálogo.
            </p>
            <button onClick={onClose} className="btn-primary mt-5">
              Ver catálogo
            </button>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {cart.map((item) => {
              const key = itemKey(item);
              return (
                <li key={key} className="px-6 py-4 flex gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      {item.code} · {item.kind === "REPUESTO" ? "Repuesto" : "Servicio"}
                    </p>
                    <h4 className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">{item.name}</h4>
                    <p className="text-sm font-semibold text-slate-900 mt-1 tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                      {item.quantity > 1 && (
                        <span className="ml-1.5 text-xs font-normal text-slate-500">
                          ({formatPrice(item.price)} c/u)
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => removeFromCart(key)}
                      className="mt-1 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
                    >
                      Quitar
                    </button>
                  </div>

                  <div className="self-start flex items-center rounded-lg border border-slate-200">
                    <button
                      onClick={() => updateQuantity(key, -1)}
                      aria-label={`Restar una unidad de ${item.name}`}
                      className="w-8 h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(key, 1)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      aria-label={`Sumar una unidad de ${item.name}`}
                      className="w-8 h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 space-y-4 shrink-0">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-slate-600">Subtotal estimado</span>
              <strong className="text-lg font-bold text-slate-900 tabular-nums">{formatPrice(subtotal)}</strong>
            </div>
            <p className="text-[11px] text-slate-500 -mt-2">
              El total final se confirma con los precios vigentes al enviar la solicitud.
            </p>
            <button onClick={onProceedCheckout} className="btn-primary w-full h-11">
              Continuar con la solicitud
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

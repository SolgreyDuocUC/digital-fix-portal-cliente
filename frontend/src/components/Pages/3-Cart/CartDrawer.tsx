import React from "react";
import { useCart } from "../../../contexts/CartContext";
import { formatPrice } from "../../../utils/currency";
import { Icon } from "../../ui/Icon";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedCheckout,
}) => {
  const { cart, subtotal, updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer lateral */}
      <aside
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slideInRight"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              RESUMEN DE SOLICITUD
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              Carrito de Mantención
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Lista de productos / servicios */}
        {cart.length === 0 ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Icon name="cart" size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tu carrito está vacío</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Agrega servicios técnicos en terreno o repuestos certificados de nuestro catálogo.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              Explorar Catálogo Eléctrico
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 transition shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Icon name={item.iconType} size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                    {item.code} • {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-black text-slate-900">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      ✓ Despacho en terreno
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-slate-900"
                  >
                    <Icon name="minus" size={12} />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-slate-900"
                  >
                    <Icon name="plus" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resumen de totales y checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50/90 space-y-4">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal neto</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Despacho cuadrilla</span>
                <strong className="font-extrabold">GRATIS</strong>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>Total Estimado</span>
                <span className="text-xl text-blue-600">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={onProceedCheckout}
              className="w-full py-3.5 bg-slate-950 hover:bg-blue-600 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>Continuar al Despacho en Terreno</span>
              <Icon name="arrow" size={16} />
            </button>

            <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <Icon name="lock" size={12} />
              Portal de clientes aislado • Cero dependencia de Entra ID
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, ElectricalProduct, itemKey } from "../types/product";

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  /** Suma referencial con los precios del catálogo; el total final lo calcula el backend con el ERP. */
  subtotal: number;
  addToCart: (product: ElectricalProduct) => void;
  /** key = itemKey(item) */
  updateQuantity: (key: string, delta: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = "digitalfix_portal_carrito";

const CartContext = createContext<CartContextType | undefined>(undefined);

const leerCarrito = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    const data: CartItem[] = stored ? JSON.parse(stored) : [];
    // Descarta ítems guardados por versiones anteriores sin tipo de ítem.
    return Array.isArray(data) ? data.filter((i) => i && (i.kind === "REPUESTO" || i.kind === "SERVICIO")) : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(leerCarrito);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [cart]);

  const addToCart = (product: ElectricalProduct) => {
    const key = itemKey(product);
    setCart((prev) => {
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        return prev.map((i) => (itemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (itemKey(item) === key ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((item) => itemKey(item) !== key));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, subtotal, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser utilizado dentro de un CartProvider");
  }
  return context;
};

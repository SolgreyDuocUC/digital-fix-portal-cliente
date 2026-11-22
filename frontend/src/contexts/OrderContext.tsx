import React, { createContext, useContext, useState, useEffect } from "react";
import { ClientOrder } from "@/types/order";
import { INITIAL_ORDERS } from "@/components/Pages/5-MyOrders/MyOrdersPage";
import { getStoredOrders, saveStoredOrders } from "@/services/orderService";

interface OrderContextType {
  orders: ClientOrder[];
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  addOrder: (order: ClientOrder) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<ClientOrder[]>(() => {
    const stored = getStoredOrders();
    return stored.length > 0 ? [...stored, ...INITIAL_ORDERS] : INITIAL_ORDERS;
  });

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>("DF-1042");

  const addOrder = (order: ClientOrder) => {
    setOrders((prev) => [order, ...prev]);
    setSelectedOrderId(order.id);
  };

  useEffect(() => {
    // Sincronizar storage
    const custom = orders.filter((o) => !INITIAL_ORDERS.some((init) => init.id === o.id));
    saveStoredOrders(custom);
  }, [orders]);

  return (
    <OrderContext.Provider value={{ orders, selectedOrderId, setSelectedOrderId, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders debe usarse dentro de un OrderProvider");
  }
  return context;
};
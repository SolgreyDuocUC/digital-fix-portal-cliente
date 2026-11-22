import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ClientOrder } from "@/types/order";
import { fetchMyOrders } from "@/services/orderService";
import { errorMessage } from "@/services/api";
import { useAuth } from "./AuthContext";

interface OrderContextType {
  orders: ClientOrder[];
  loading: boolean;
  error: string | null;
  /** Vuelve a consultar el estado en vivo de los pedidos. */
  refresh: () => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  /** Agrega un pedido recién creado sin esperar a la siguiente consulta. */
  addOrder: (order: ClientOrder) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

/** Pedidos del cliente con sesión iniciada (backend → ms-workorders). */
export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const esCliente = user?.role === "CLIENTE";
  const clientName = user?.fullName ?? "";
  const clientRut = user?.rut ?? "";

  useEffect(() => {
    if (!esCliente) {
      setOrders([]);
      setError(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetchMyOrders({ name: clientName, rut: clientRut }, ctrl.signal)
      .then(setOrders)
      .catch((err) => {
        if ((err as Error)?.name !== "AbortError") setError(errorMessage(err));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [esCliente, clientName, clientRut, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const addOrder = useCallback((order: ClientOrder) => {
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    setSelectedOrderId(order.id);
  }, []);

  return (
    <OrderContext.Provider
      value={{ orders, loading, error, refresh, selectedOrderId, setSelectedOrderId, addOrder }}
    >
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

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ClientOrder } from "@/types/order";
import { fetchMyOrders } from "@/services/orderService";
import { errorMessage } from "@/services/api";
import { useAuth } from "./AuthContext";

/** Cada cuánto se vuelve a consultar el estado en vivo mientras la pestaña está visible. */
const INTERVALO_SEGUIMIENTO_MS = 60_000;

interface OrderContextType {
  orders: ClientOrder[];
  loading: boolean;
  error: string | null;
  /** Momento de la última consulta exitosa a la central. */
  lastUpdated: Date | null;
  /** Vuelve a consultar el estado en vivo de los pedidos. */
  refresh: () => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  /** Agrega (o reemplaza) un pedido sin esperar a la siguiente consulta. */
  addOrder: (order: ClientOrder) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

/** Pedidos del cliente con sesión iniciada (backend → ms-workorders). */
export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const enCurso = useRef<AbortController | null>(null);

  const esCliente = user?.role === "CLIENTE";
  const clientName = user?.fullName ?? "";
  const clientRut = user?.rut ?? "";

  useEffect(() => {
    if (!esCliente) {
      setOrders([]);
      setError(null);
      setLastUpdated(null);
      return;
    }
    enCurso.current?.abort();
    const ctrl = new AbortController();
    enCurso.current = ctrl;
    setLoading(true);
    setError(null);
    fetchMyOrders({ name: clientName, rut: clientRut }, ctrl.signal)
      .then((lista) => {
        setOrders(lista);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if ((err as Error)?.name !== "AbortError") setError(errorMessage(err));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [esCliente, clientName, clientRut, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  // Seguimiento en vivo: consulta periódica solo con la pestaña visible, y una consulta inmediata
  // al volver a ella (así el cliente ve el avance sin tocar "Actualizar").
  useEffect(() => {
    if (!esCliente) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, INTERVALO_SEGUIMIENTO_MS);
    const alVolver = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [esCliente, refresh]);

  const addOrder = useCallback((order: ClientOrder) => {
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    setSelectedOrderId(order.id);
  }, []);

  return (
    <OrderContext.Provider
      value={{ orders, loading, error, lastUpdated, refresh, selectedOrderId, setSelectedOrderId, addOrder }}
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

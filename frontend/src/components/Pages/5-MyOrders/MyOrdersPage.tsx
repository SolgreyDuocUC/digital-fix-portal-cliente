import React, { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useOrders } from "../../../contexts/OrderContext";
import { ClientOrder } from "../../../types/order";
import { formatPrice } from "../../../utils/currency";
import { formatDate } from "../../../utils/dateUtils";
import { Stepper } from "../../ui/Stepper";
import { fetchOrderByCode } from "../../../services/orderService";
import { errorMessage } from "../../../services/api";

const FORMATO_CODIGO = /^(PED-[A-Z0-9]{6}|OT-\d+)$/;

interface MyOrdersPageProps {
  onLogin?: () => void;
  onGoToCatalog?: () => void;
}

/** Color del estado: neutro mientras avanza, verde al cerrar, rojo si se canceló. */
const estadoClase = (status: string) => {
  if (status === "CERRADA" || status === "FINALIZADA") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (status === "CANCELADA" || status === "RECHAZADA") return "bg-red-50 text-red-700 border-red-200";
  if (status === "CREADA" || status === "PENDIENTE") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-brand-50 text-brand-700 border-brand-200";
};

const etiquetaEstado = (o: ClientOrder) =>
  o.statusLabel ?? o.status.charAt(0) + o.status.slice(1).toLowerCase().replace(/_/g, " ");

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onLogin, onGoToCatalog }) => {
  const { user, isAuthenticated } = useAuth();
  const { orders, loading, error, lastUpdated, refresh, selectedOrderId, setSelectedOrderId, addOrder } = useOrders();
  const [expandedId, setExpandedId] = useState<string | null>(selectedOrderId);
  const [codigoBuscado, setCodigoBuscado] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedOrderId) return;
    setExpandedId(selectedOrderId);
    // Lleva la vista a la orden elegida (recién comprada o buscada por código).
    requestAnimationFrame(() =>
      document.getElementById(`orden-${selectedOrderId}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }, [selectedOrderId, orders]);

  /** Busca un pedido (PED-XXXXXX) u OT (OT-123): primero en la lista, si no, en la central. */
  const seguirOrden = async (e: FormEvent) => {
    e.preventDefault();
    const codigo = codigoBuscado.trim().toUpperCase();
    setErrorBusqueda(null);
    if (!FORMATO_CODIGO.test(codigo)) {
      setErrorBusqueda("Ingresa un código como PED-A1B2C3 o OT-125.");
      return;
    }
    const enLista = orders.find((o) => o.id === codigo || o.trackingCode === codigo);
    if (enLista) {
      setSelectedOrderId(enLista.id);
      return;
    }
    setBuscando(true);
    try {
      const orden = await fetchOrderByCode(codigo, { name: user?.fullName ?? "", rut: user?.rut ?? "" });
      addOrder(orden);
    } catch (err) {
      setErrorBusqueda(errorMessage(err));
    } finally {
      setBuscando(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Seguimiento de órdenes</h1>
        <p className="text-sm text-slate-500 mt-2">Ingresa con tu cuenta para ver el estado de tus solicitudes.</p>
        {onLogin && (
          <button onClick={onLogin} className="btn-primary mt-6">
            Ingresar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="page-head">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Mis órdenes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pedidos hechos en el portal y atenciones que la central registró a nombre de {user?.fullName}.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button onClick={refresh} disabled={loading} className="btn-secondary">
            {loading ? "Actualizando..." : "Actualizar estado"}
          </button>
          {lastUpdated && (
            <p className="text-[11px] text-slate-500" aria-live="polite">
              Actualizado a las{" "}
              {lastUpdated.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} · se
              actualiza solo cada minuto
            </p>
          )}
        </div>
      </div>

      <form onSubmit={seguirOrden} className="panel p-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <label className="flex-1 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Seguir una orden</span>
          <span className="block text-slate-500 mt-0.5">
            Código de tu pedido (PED-…) o de la orden de trabajo que te dio la central (OT-…).
          </span>
          <input
            value={codigoBuscado}
            onChange={(e) => setCodigoBuscado(e.target.value)}
            placeholder="PED-A1B2C3 u OT-125"
            className="input mt-2 w-full uppercase"
            autoComplete="off"
            aria-invalid={!!errorBusqueda}
            aria-describedby={errorBusqueda ? "error-busqueda" : undefined}
          />
        </label>
        <button type="submit" disabled={buscando || !codigoBuscado.trim()} className="btn-primary">
          {buscando ? "Buscando..." : "Ver seguimiento"}
        </button>
      </form>
      {errorBusqueda && (
        <p id="error-busqueda" role="alert" className="-mt-3 text-xs text-red-700">
          {errorBusqueda}
        </p>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="panel p-10 text-center">
          <h2 className="text-base font-semibold text-slate-900">Aún no tienes órdenes</h2>
          <p className="text-sm text-slate-500 mt-1">Cuando solicites un servicio o repuesto, verás aquí su avance.</p>
          {onGoToCatalog && (
            <button onClick={onGoToCatalog} className="btn-primary mt-5">
              Ver catálogo
            </button>
          )}
        </div>
      )}

      {loading && orders.length === 0 && (
        <div className="panel p-10 text-center text-sm text-slate-500">Consultando tus órdenes...</div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;
          return (
            <article
              key={order.id}
              id={`orden-${order.id}`}
              className={`panel overflow-hidden scroll-mt-24 ${
                selectedOrderId === order.id ? "ring-2 ring-brand-200" : ""
              }`}
            >
              <header className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                  <div>
                    <dt className="eyebrow">{order.origin === "ERP" ? "Orden de trabajo" : "Pedido"}</dt>
                    <dd className="font-semibold text-slate-900">{order.id}</dd>
                  </div>
                  {order.trackingCode && order.trackingCode !== order.id && (
                    <div>
                      <dt className="eyebrow">Orden de trabajo</dt>
                      <dd className="font-semibold text-slate-900">{order.trackingCode}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="eyebrow">Fecha</dt>
                    <dd className="text-slate-700">{formatDate(order.createdAt)}</dd>
                  </div>
                  {order.totalAmount > 0 && (
                    <div>
                      <dt className="eyebrow">Total</dt>
                      <dd className="font-semibold text-slate-900 tabular-nums">{formatPrice(order.totalAmount)}</dd>
                    </div>
                  )}
                </dl>
                <span className={`badge border ${estadoClase(order.status)}`}>{etiquetaEstado(order)}</span>
              </header>

              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900">{order.serviceTitle}</h2>
                    {order.address && <p className="text-xs text-slate-500 mt-0.5">{order.address}</p>}
                  </div>
                  {order.origin === "ERP" && (
                    <span className="badge bg-slate-100 text-slate-600">Registrada por la central</span>
                  )}
                </div>

                {order.trackingSteps.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <Stepper steps={order.trackingSteps} />
                    {order.liveTracking === false && (
                      <p className="text-[11px] text-slate-500 mt-2">
                        No pudimos consultar la central; se muestra el último estado conocido.
                      </p>
                    )}
                  </div>
                )}

                {(order.crew || order.preferredSchedule || order.statusUpdatedAt || order.closedAt) && (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {order.statusUpdatedAt && !order.closedAt && (
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <dt className="text-slate-500">Último cambio de estado</dt>
                        <dd className="font-medium text-slate-900 mt-0.5">{formatDate(order.statusUpdatedAt)}</dd>
                      </div>
                    )}
                    {order.closedAt && (
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <dt className="text-slate-500">
                          {order.status === "CANCELADA" ? "Cancelada el" : "Finalizada el"}
                        </dt>
                        <dd className="font-medium text-slate-900 mt-0.5">{formatDate(order.closedAt)}</dd>
                      </div>
                    )}
                    {order.crew && (
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <dt className="text-slate-500">Cuadrilla asignada</dt>
                        <dd className="font-medium text-slate-900 mt-0.5">{order.crew}</dd>
                      </div>
                    )}
                    {order.preferredSchedule && (
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <dt className="text-slate-500">Horario solicitado</dt>
                        <dd className="font-medium text-slate-900 mt-0.5">{order.preferredSchedule}</dd>
                      </div>
                    )}
                  </dl>
                )}

                {order.items.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{order.items.length === 1 ? "1 ítem" : `${order.items.length} ítems`}</span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="font-semibold text-brand-600 hover:text-brand-700"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                      </button>
                    </div>

                    {isExpanded && (
                      <ul className="mt-3 rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
                        {order.items.map((it, idx) => (
                          <li key={idx} className="flex justify-between gap-4 px-3 py-2 text-slate-700">
                            <span>
                              {it.quantity} × {it.name}
                              {it.code && <span className="text-slate-400"> · {it.code}</span>}
                            </span>
                            {it.unitPrice > 0 && (
                              <strong className="tabular-nums">{formatPrice(it.unitPrice * it.quantity)}</strong>
                            )}
                          </li>
                        ))}
                        {!!order.discount && order.discount > 0 && (
                          <li className="flex justify-between px-3 py-2 text-slate-600">
                            <span>Descuento{order.couponCode && ` (${order.couponCode})`}</span>
                            <span className="tabular-nums">−{formatPrice(order.discount)}</span>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

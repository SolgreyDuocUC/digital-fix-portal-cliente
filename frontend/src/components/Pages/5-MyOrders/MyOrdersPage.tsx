import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useOrders } from "../../../contexts/OrderContext";
import { ClientOrder, OrderStatus } from "../../../types/order";
import { formatPrice } from "../../../utils/currency";
import { formatDate } from "../../../utils/dateUtils";
import { Icon } from "../../ui/Icon";
import { Stepper } from "../../ui/Stepper";

export const INITIAL_ORDERS: ClientOrder[] = [
  {
    id: "DF-1042",
    numericId: 1042,
    createdAt: "2026-09-12T09:10:00Z",
    status: "EN_DESPLAZAMIENTO",
    serviceTitle: "Mantención Preventiva de Tablero y Cambio de Automático 25A",
    categoryBadge: "Urgencia en terreno",
    address: "Av. Providencia 1234, Of. 602",
    commune: "Providencia, Región Metropolitana",
    clientRut: "76.123.456-7",
    clientName: "Comercial Rojas Ltda.",
    totalAmount: 47980,
    deliveryDateEstimate: "Arribo estimado: Hoy antes de las 12:00 hrs",
    technicianName: "Pedro Valenzuela",
    technicianSecLicense: "Instalador Autorizado SEC Clase A (Reg. N° 45.291)",
    technicianTeam: "Cuadrilla Alfa Terreno",
    technicianVehicle: "Furgón Hyundai Porter H-102 (KJ-82-19)",
    technicianPhone: "+56 9 7654 3210",
    items: [
      {
        productId: 1,
        code: "SRV-EMG-01",
        name: "Visita Técnica Eléctrica de Emergencia",
        category: "Emergencias",
        quantity: 1,
        unitPrice: 34990,
      },
      {
        productId: 5,
        code: "REP-AUT-25",
        name: "Interruptor Automático 25A Bipolar Legrand",
        category: "Repuestos",
        quantity: 1,
        unitPrice: 12990,
      },
    ],
    trackingSteps: [
      {
        status: "CREADA",
        label: "Orden Creada",
        subtitle: "Solicitud registrada",
        timestamp: "12 sept, 09:10",
        completed: true,
        current: false,
      },
      {
        status: "ASIGNADA",
        label: "Técnico Asignado",
        subtitle: "Cuadrilla Alfa asignada",
        timestamp: "12 sept, 09:30",
        completed: true,
        current: false,
      },
      {
        status: "EN_DESPLAZAMIENTO",
        label: "En Camino",
        subtitle: "Técnico en ruta",
        timestamp: "12 sept, 10:15",
        completed: false,
        current: true,
      },
      {
        status: "EN_EJECUCION",
        label: "En Terreno",
        subtitle: "Revisión tablero",
        completed: false,
        current: false,
      },
      {
        status: "CERRADA",
        label: "Finalizada",
        subtitle: "Acta técnica SEC",
        completed: false,
        current: false,
      },
    ],
  },
  {
    id: "DF-1020",
    numericId: 1020,
    createdAt: "2026-09-07T09:00:00Z",
    status: "CERRADA",
    serviceTitle: "Inspección Termográfica y Certificación TE1 en Sala de Bombas",
    categoryBadge: "Certificado SEC emitido",
    address: "Condominio Los Aromos 450",
    commune: "Las Condes, Región Metropolitana",
    clientRut: "76.123.456-7",
    clientName: "Comercial Rojas Ltda.",
    totalAmount: 89990,
    deliveryDateEstimate: "Servicio completado satisfactoriamente",
    technicianName: "Carlos Méndez",
    technicianSecLicense: "Ingeniero Eléctrico SEC Clase A (Reg. N° 38.104)",
    technicianTeam: "Cuadrilla Gama Alta Tensión",
    reportPdfUrl: "/reports/certificado-sec-1020.pdf",
    items: [
      {
        productId: 3,
        code: "SRV-SEC-03",
        name: "Normalización Eléctrica y Tramitación TE1 (SEC)",
        category: "Certificación SEC",
        quantity: 1,
        unitPrice: 89990,
      },
    ],
    trackingSteps: [
      {
        status: "CREADA",
        label: "Creada",
        subtitle: "07 sept, 09:00",
        timestamp: "7 sept, 09:00",
        completed: true,
        current: false,
      },
      {
        status: "ASIGNADA",
        label: "Asignada",
        subtitle: "07 sept, 09:20",
        timestamp: "7 sept, 09:20",
        completed: true,
        current: false,
      },
      {
        status: "EN_DESPLAZAMIENTO",
        label: "En Camino",
        subtitle: "07 sept, 10:00",
        timestamp: "7 sept, 10:00",
        completed: true,
        current: false,
      },
      {
        status: "EN_EJECUCION",
        label: "En Terreno",
        subtitle: "07 sept, 11:30",
        timestamp: "7 sept, 11:30",
        completed: true,
        current: false,
      },
      {
        status: "CERRADA",
        label: "Finalizada",
        subtitle: "07 sept, 14:00",
        timestamp: "7 sept, 14:00",
        completed: true,
        current: true,
      },
    ],
  },
];

export const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, selectedOrderId } = useOrders();
  const [expandedId, setExpandedId] = useState<string | null>(selectedOrderId || "DF-1042");

  React.useEffect(() => {
    if (selectedOrderId) {
      setExpandedId(selectedOrderId);
    }
  }, [selectedOrderId]);

  const getStatusPill = (status: OrderStatus) => {
    switch (status) {
      case "EN_DESPLAZAMIENTO":
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            Técnico en desplazamiento
          </span>
        );
      case "EN_EJECUCION":
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
            En ejecución en terreno
          </span>
        );
      case "CERRADA":
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
            ✓ Finalizada y Certificada
          </span>
        );
      case "ASIGNADA":
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            Cuadrilla Asignada
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Mis Órdenes de Mantención Eléctrica
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Seguimiento de cuadrillas, fecha estimada de arribo y descarga de actas SEC.
          </p>
        </div>

        <div className="text-xs text-slate-600 font-medium">
          Cliente: <strong className="text-slate-900">{user?.fullName || "Comercial Rojas Ltda."}</strong>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;

          return (
            <article
              key={order.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Encabezado de la orden */}
              <div className="bg-slate-50/70 px-5 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">N° Orden</span>
                    <strong className="text-xs font-bold text-slate-900">{order.id}</strong>
                  </div>

                  <div className="border-l border-slate-200 pl-4 hidden sm:block">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha</span>
                    <span className="text-slate-700">{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <strong className="text-slate-900">{formatPrice(order.totalAmount)}</strong>
                  </div>
                </div>

                <div>{getStatusPill(order.status)}</div>
              </div>

              {/* Contenido */}
              <div className="p-5 sm:p-6 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {order.serviceTitle}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Icon name="mapPin" size={12} className="text-slate-400" />
                    <span>{order.address}, {order.commune}</span>
                  </p>
                </div>

                {/* Línea de tiempo / Stepper sobrio */}
                <div className="bg-slate-50/60 rounded-lg p-4 border border-slate-200/60">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700">Estado del servicio</span>
                    <span className="font-bold text-slate-900">{order.deliveryDateEstimate}</span>
                  </div>
                  <Stepper steps={order.trackingSteps} />
                </div>

                {/* Datos del técnico en terreno */}
                {order.technicianName && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        {order.technicianTeam}
                      </span>
                      <strong className="text-slate-900 text-xs block">
                        {order.technicianName}
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        {order.technicianSecLicense}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === "CERRADA" ? (
                        <button
                          onClick={() => alert(`Descargando Certificado SEC para orden ${order.id}`)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Icon name="download" size={13} />
                          <span>Descargar Acta SEC</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
                          {order.technicianVehicle}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Desglose desplegable */}
                <div className="pt-2 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100">
                  <span>{order.items.length} ítems incluidos</span>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="text-slate-700 hover:text-slate-900 font-semibold"
                  >
                    {isExpanded ? "Ocultar desglose" : "Ver detalle →"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>{it.quantity}x {it.name} <span className="text-slate-400">({it.code})</span></span>
                        <strong>{formatPrice(it.unitPrice * it.quantity)}</strong>
                      </div>
                    ))}
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

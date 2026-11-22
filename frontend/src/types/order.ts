export type OrderStatus =
  | "CREADA"
  | "ASIGNADA"
  | "EN_DESPLAZAMIENTO"
  | "EN_EJECUCION"
  | "CERRADA"
  | "CANCELADA"
  // ms-workorders puede agregar estados; se muestran con su etiqueta.
  | (string & {});

export interface TrackingStep {
  status: OrderStatus;
  label: string;
  subtitle: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

export interface ClientOrderItem {
  productId: number;
  kind?: "REPUESTO" | "SERVICIO";
  code: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientOrder {
  /** Código del pedido en el portal (PED-...) o de la OT si la creó la central. */
  id: string;
  /** Código de seguimiento de la Orden de Trabajo en ms-workorders (OT-123). */
  trackingCode?: string;
  /** PORTAL: comprado en la tienda · ERP: OT creada por la central para este cliente. */
  origin?: "PORTAL" | "ERP";
  statusLabel?: string;
  /** false si ms-workorders no respondió y el estado es el último conocido. */
  liveTracking?: boolean;
  crew?: string;
  statusUpdatedAt?: string;
  closedAt?: string;
  preferredSchedule?: string;
  subtotal?: number;
  discount?: number;
  couponCode?: string;
  numericId: number;
  createdAt: string;
  status: OrderStatus;
  serviceTitle: string;
  categoryBadge: string;
  address: string;
  commune: string;
  clientRut: string;
  clientName: string;
  totalAmount: number;
  deliveryDateEstimate: string; // "Llega hoy antes de las 18:00 hrs"
  technicianName?: string;
  technicianSecLicense?: string; // "Instalador SEC Clase A N° 45.291"
  technicianTeam?: string; // "Cuadrilla Alfa Terreno"
  technicianVehicle?: string; // "Furgón Hyundai Porter H-102 (Patente: KJ-82-19)"
  technicianPhone?: string;
  items: ClientOrderItem[];
  trackingSteps: TrackingStep[];
  notes?: string;
  reportPdfUrl?: string;
}

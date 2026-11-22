export type OrderStatus =
  | "CREADA"
  | "ASIGNADA"
  | "EN_DESPLAZAMIENTO"
  | "EN_EJECUCION"
  | "CERRADA"
  | "CANCELADA";

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
  code: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientOrder {
  id: string; // ej: "DF-1042"
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

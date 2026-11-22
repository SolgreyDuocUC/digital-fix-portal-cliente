export type ServiceCategory =
  | "Todos"
  | "Emergencias"
  | "Tableros & Potencia"
  | "Certificación SEC"
  | "Generadores"
  | "Repuestos";

export interface ElectricalProduct {
  id: number;
  code: string; // ej: "SRV-EMG-01", "REP-AUT-25"
  name: string;
  category: Exclude<ServiceCategory, "Todos">;
  description: string;
  price: number;
  originalPrice?: number;
  highlightBadge?: string; // "MÁS SOLICITADO", "LLEGA HOY", "OFERTA PYME"
  responseTime: string; // "< 2 horas", "24 a 48 hrs", "Inmediato"
  warrantyMonths: number;
  freeDispatch: boolean;
  stock?: number;
  iconType: "bolt" | "shield" | "panel" | "breaker" | "generator" | "meter" | "cable";
}

export type CartItem = ElectricalProduct & {
  quantity: number;
  selectedLocation?: string;
};

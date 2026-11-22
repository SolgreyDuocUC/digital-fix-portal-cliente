import { QuickCategory } from "@/types/catalog";

export const QUICK_CATEGORIES: QuickCategory[] = [
  { name: "Emergencias", label: "Emergencias 24/7", subtitle: "Respuesta en < 2 hrs", target: "services" },
  { name: "Tableros & Potencia", label: "Tableros eléctricos", subtitle: "Mantención preventiva", target: "services" },
  { name: "Certificación SEC", label: "Certificación TE1", subtitle: "Firma Instalador SEC", target: "services" },
  { name: "Generadores", label: "Grupos electrógenos", subtitle: "Pruebas de transferencia", target: "services" },
  { name: "Repuestos", label: "Repuestos certificados", subtitle: "Stock disponible", target: "products" },
];

export const SERVICE_CATEGORIES: string[] = [
  "Todos",
  "Emergencias",
  "Tableros & Potencia",
  "Certificación SEC",
  "Generadores",
];

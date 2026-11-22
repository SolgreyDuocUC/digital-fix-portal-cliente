export type ServiceCategory =
  | "Todos"
  | "Emergencias"
  | "Tableros & Potencia"
  | "Certificación SEC"
  | "Generadores"
  | "Repuestos";

/** Origen del ítem en el ERP: REPUESTO viene de ms-catalog, SERVICIO de ms-workorders. */
export type ItemKind = "REPUESTO" | "SERVICIO";

export interface ElectricalProduct {
  /** Id en su microservicio. Un repuesto y un servicio pueden compartir id: la llave es kind + id. */
  id: number;
  kind: ItemKind;
  code: string;
  name: string;
  /** Categoría de tienda (la define Marketing o viene del ERP). Los repuestos usan "Repuestos". */
  category: string;
  description: string;
  /** Precio final, con el descuento de tienda aplicado. */
  price: number;
  /** Precio de lista del ERP, solo si hay descuento. */
  originalPrice?: number;
  highlightBadge?: string;
  featured?: boolean;
  brand?: string;
  unit?: string;
  secCertified?: boolean;
  responseTime?: string;
  warrantyMonths?: number;
  freeDispatch?: boolean;
  /** Solo repuestos: stock disponible real (descontadas las reservas). */
  stock?: number;
  available?: boolean;
  iconType?: "bolt" | "shield" | "panel" | "breaker" | "generator" | "meter" | "cable";
  /** URL directa de la imagen (Marketing la vincula desde Google Drive). */
  imageUrl?: string;
}

export type CartItem = ElectricalProduct & {
  quantity: number;
  selectedLocation?: string;
};

/** Llave única de un ítem en el carrito y en las listas. */
export const itemKey = (item: Pick<ElectricalProduct, "kind" | "id">): string => `${item.kind}-${item.id}`;

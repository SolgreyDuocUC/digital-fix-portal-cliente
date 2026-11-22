export type CatalogView = "home" | "services" | "products";

export interface QuickCategory {
  name: string;
  label: string;
  subtitle: string;
  /** A qué pestaña lleva esta tarjeta */
  target: Exclude<CatalogView, "home">;
}

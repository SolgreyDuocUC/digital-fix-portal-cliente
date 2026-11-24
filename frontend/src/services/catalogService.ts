/**
 * Catálogo de la tienda.
 *
 * El frontend consulta directamente a ms-catalog (repuestos y servicios) sin pasar por
 * el backend del portal. El proxy de Vite reenvía /ms-catalog → http://localhost:8088
 * en desarrollo; en producción se usa VITE_MS_CATALOG_URL.
 */
import { ElectricalProduct, ItemKind } from "@/types/product";
import { msRepuestos, msServicios, RepuestoCatalogo, ServicioCatalogo } from "./msApi";

// ── Adaptadores ──────────────────────────────────────────────────────────────

const repuestoToProduct = (r: RepuestoCatalogo): ElectricalProduct => ({
  id: r.id,
  kind: "REPUESTO" as ItemKind,
  code: r.codigo,
  name: r.nombre,
  category: "Repuestos",
  description: r.descripcion?.trim() || "Repuesto eléctrico del catálogo DigitalFix.",
  price: Number(r.precio),
  originalPrice: undefined,
  highlightBadge: undefined,
  featured: false,
  brand: r.marca ?? undefined,
  unit: r.unidadMedida ?? undefined,
  secCertified: false,
  stock: r.stockDisponible ?? 0,
  available: r.activo && (r.stockDisponible ?? 0) > 0,
  imageUrl: undefined,
});

const servicioToProduct = (s: ServicioCatalogo): ElectricalProduct => ({
  id: s.id,
  kind: "SERVICIO" as ItemKind,
  code: s.codigo,
  name: s.nombre,
  category: s.categoria?.trim() || "Servicios generales",
  description: s.descripcion?.trim() || "Servicio técnico en terreno.",
  price: Number(s.tarifa),
  originalPrice: undefined,
  highlightBadge: undefined,
  featured: false,
  brand: undefined,
  unit: undefined,
  secCertified: false,
  stock: undefined,
  available: s.estado === "ACTIVO" && (s.stock ?? 0) > 0,
  imageUrl: undefined,
});

// ── API pública ──────────────────────────────────────────────────────────────

export interface CatalogResult {
  items: ElectricalProduct[];
  /** Secciones que no se pudieron cargar (p. ej. ms-catalog caído). */
  errors: string[];
}

/**
 * Repuestos y servicios a la venta directo desde ms-catalog.
 * Cada petición va por separado: si un endpoint falla, el otro igual se muestra.
 */
export async function fetchCatalog(signal?: AbortSignal): Promise<CatalogResult> {
  const [repuestosRes, serviciosRes] = await Promise.allSettled([
    msRepuestos.listar(signal),
    msServicios.listar(signal),
  ]);

  const items: ElectricalProduct[] = [];
  const errors: string[] = [];

  if (serviciosRes.status === "fulfilled") {
    items.push(...serviciosRes.value.map(servicioToProduct));
  } else {
    errors.push("servicios");
  }

  if (repuestosRes.status === "fulfilled") {
    items.push(...repuestosRes.value.map(repuestoToProduct));
  } else {
    errors.push("repuestos");
  }

  return { items, errors };
}

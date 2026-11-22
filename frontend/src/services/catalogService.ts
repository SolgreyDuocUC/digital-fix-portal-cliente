import { ElectricalProduct, ItemKind } from "@/types/product";
import { api } from "./api";

/** ProductoPublicoDTO del backend: repuesto (ms-catalog) o servicio (ms-workorders) con la capa de Marketing. */
export interface ProductoPublicoDTO {
  id: number;
  tipo: ItemKind;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  precio: number;
  precioLista: number | null;
  descuentoPorcentaje: number | null;
  stock: number | null;
  disponible: boolean;
  unidadMedida: string | null;
  certificacionSEC: boolean;
  marca: string | null;
  imagenUrl: string | null;
  badge: string | null;
  destacado: boolean;
}

export const toProduct = (p: ProductoPublicoDTO): ElectricalProduct => {
  const isPart = p.tipo === "REPUESTO";
  const precio = Number(p.precio);
  const lista = p.precioLista != null ? Number(p.precioLista) : undefined;
  return {
    id: p.id,
    kind: p.tipo,
    code: p.codigo,
    name: p.nombre,
    // Los repuestos se agrupan en una sola sección de tienda.
    category: isPart ? "Repuestos" : p.categoria?.trim() || "Servicios generales",
    description: p.descripcion?.trim() || (isPart ? "Repuesto eléctrico del catálogo DigitalFix." : "Servicio técnico en terreno."),
    price: precio,
    originalPrice: lista !== undefined && lista > precio ? lista : undefined,
    highlightBadge: p.badge ?? undefined,
    featured: p.destacado,
    brand: p.marca ?? undefined,
    unit: p.unidadMedida ?? undefined,
    secCertified: p.certificacionSEC,
    stock: isPart ? (p.stock ?? 0) : undefined,
    available: p.disponible,
    imageUrl: p.imagenUrl ?? undefined,
  };
};

export interface CatalogResult {
  items: ElectricalProduct[];
  /** Secciones que no se pudieron cargar (p. ej. ms-catalog caído). */
  errors: string[];
}

/**
 * Repuestos y servicios a la venta. Cada lista se pide por separado: si un microservicio no
 * responde, la otra sección igual se muestra.
 */
export async function fetchCatalog(signal?: AbortSignal): Promise<CatalogResult> {
  const [repuestos, servicios] = await Promise.allSettled([
    api<ProductoPublicoDTO[]>("/products", { auth: false, signal }),
    api<ProductoPublicoDTO[]>("/products/services", { auth: false, signal }),
  ]);
  const items: ElectricalProduct[] = [];
  const errors: string[] = [];
  if (servicios.status === "fulfilled") items.push(...servicios.value.map(toProduct));
  else errors.push("servicios");
  if (repuestos.status === "fulfilled") items.push(...repuestos.value.map(toProduct));
  else errors.push("repuestos");
  return { items, errors };
}

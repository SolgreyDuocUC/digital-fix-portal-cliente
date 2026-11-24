/**
 * Cliente HTTP ligero para los microservicios públicos de DigitalFix.
 *
 * El frontend llama directamente a:
 *   - ms-catalog  → /ms-catalog/api/catalog/...
 *   - ms-workorders (público) → /ms-workorders/api/...  (sólo rutas de consulta pública)
 *
 * En desarrollo, Vite hace el proxy desde estas rutas al puerto local de cada MS.
 * En producción, se apunta a la URL del servicio vía VITE_MS_CATALOG_URL / VITE_MS_WORKORDERS_URL.
 *
 * Para pedidos (checkout) y autenticación de clientes el frontend sigue usando api.ts → backend portal.
 */

const MS_CATALOG_BASE =
  (import.meta.env.VITE_MS_CATALOG_URL ?? "") + "/ms-catalog";

const MS_WORKORDERS_BASE =
  (import.meta.env.VITE_MS_WORKORDERS_URL ?? "") + "/ms-workorders";

export class MsApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "MsApiError";
  }
}

async function fetchMs<T>(url: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new MsApiError(0, "No se pudo conectar con el servicio. Revisa tu conexión.");
  }
  if (!res.ok) {
    throw new MsApiError(res.status, `Error ${res.status} al consultar el servicio.`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ── ms-catalog ───────────────────────────────────────────────────────────────

/** Repuesto individual del catálogo (tal como lo devuelve ms-catalog). */
export interface RepuestoCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  precio: number;
  stockDisponible: number;
  activo: boolean;
  unidadMedida: string | null;
  marca: string | null;
  proveedor: string | null;
}

/** Servicio técnico del catálogo (tal como lo devuelve ms-catalog). */
export interface ServicioCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  tarifa: number;
  stock: number;
  estado: string;   // ACTIVO | INACTIVO
}

export const msRepuestos = {
  /** GET /api/catalog/products — repuestos activos. */
  listar(signal?: AbortSignal): Promise<RepuestoCatalogo[]> {
    return fetchMs<RepuestoCatalogo[]>(`${MS_CATALOG_BASE}/api/catalog/products`, signal);
  },

  /** GET /api/catalog/products/{id} */
  obtener(id: number, signal?: AbortSignal): Promise<RepuestoCatalogo> {
    return fetchMs<RepuestoCatalogo>(`${MS_CATALOG_BASE}/api/catalog/products/${id}`, signal);
  },

  /** GET /api/catalog/products/categories */
  categorias(signal?: AbortSignal): Promise<string[]> {
    return fetchMs<string[]>(`${MS_CATALOG_BASE}/api/catalog/products/categories`, signal);
  },
};

export const msServicios = {
  /** GET /api/catalog/services — servicios activos. */
  listar(signal?: AbortSignal): Promise<ServicioCatalogo[]> {
    return fetchMs<ServicioCatalogo[]>(`${MS_CATALOG_BASE}/api/catalog/services`, signal);
  },
};


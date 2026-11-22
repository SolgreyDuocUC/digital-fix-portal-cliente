import { ClientOrder } from "@/types/order";
import { CartItem } from "@/types/product";
import { api } from "./api";

/** PedidoResponseDTO del backend. */
interface PedidoResponseDTO {
  codigo: string;
  origen: "PORTAL" | "ERP";
  idOrdenTrabajo: number | null;
  codigoSeguimiento: string | null;
  fechaCreacion: string;
  estado: string;
  estadoEtiqueta: string | null;
  seguimientoEnVivo: boolean;
  hitos: Array<{ estado: string; etiqueta: string; descripcion: string | null; completado: boolean; actual: boolean }>;
  cuadrilla: string | null;
  fechaActualizacionEstado: string | null;
  fechaCierre: string | null;
  direccion: string | null;
  horarioPreferido: string | null;
  notas: string | null;
  items: Array<{
    tipo: "REPUESTO" | "SERVICIO";
    id: number;
    codigo: string | null;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }> | null;
  subtotal: number | null;
  descuento: number | null;
  total: number | null;
  codigoCupon: string | null;
}

export interface CheckoutRequest {
  cart: CartItem[];
  address: {
    street: string;
    number: string;
    detail?: string;
    reference?: string;
    postalCode?: string;
    communeId: number;
    commune?: string;
  };
  preferredSchedule?: string;
  notes?: string;
  couponCode?: string;
}

const toOrder = (p: PedidoResponseDTO, clientName: string, clientRut: string): ClientOrder => {
  const items = (p.items ?? []).map((i) => ({
    productId: i.id,
    kind: i.tipo,
    code: i.codigo ?? "",
    name: i.nombre,
    category: i.tipo === "REPUESTO" ? "Repuesto" : "Servicio",
    quantity: i.cantidad,
    unitPrice: Number(i.precioUnitario),
  }));
  const first = items[0];
  const title =
    items.length === 0
      ? p.origen === "ERP"
        ? "Atención creada por la central"
        : "Pedido"
      : items.length === 1
        ? first.name
        : `${first.name} y ${items.length - 1} ítem(s) más`;

  return {
    id: p.codigo,
    numericId: p.idOrdenTrabajo ?? 0,
    trackingCode: p.codigoSeguimiento ?? undefined,
    origin: p.origen,
    createdAt: p.fechaCreacion,
    status: p.estado,
    statusLabel: p.estadoEtiqueta ?? undefined,
    liveTracking: p.seguimientoEnVivo,
    serviceTitle: title,
    categoryBadge: p.origen === "ERP" ? "Creada por la central" : "Compra en el portal",
    address: p.direccion ?? "",
    commune: "",
    clientRut,
    clientName,
    totalAmount: Number(p.total ?? 0),
    subtotal: p.subtotal != null ? Number(p.subtotal) : undefined,
    discount: p.descuento != null ? Number(p.descuento) : undefined,
    couponCode: p.codigoCupon ?? undefined,
    deliveryDateEstimate: p.horarioPreferido ?? "",
    preferredSchedule: p.horarioPreferido ?? undefined,
    crew: p.cuadrilla ?? undefined,
    statusUpdatedAt: p.fechaActualizacionEstado ?? undefined,
    closedAt: p.fechaCierre ?? undefined,
    notes: p.notas ?? undefined,
    items,
    trackingSteps: (p.hitos ?? []).map((h) => ({
      status: h.estado,
      label: h.etiqueta,
      subtitle: h.descripcion ?? "",
      completed: h.completado,
      current: h.actual,
    })),
  };
};

/**
 * Envía el carrito al backend: toma los precios del ERP, reserva el stock en ms-catalog y crea la
 * Orden de Trabajo en ms-workorders (visible al instante en el portal de empleados).
 */
export async function createOrder(
  req: CheckoutRequest,
  client: { name: string; rut: string }
): Promise<ClientOrder> {
  const dto = await api<PedidoResponseDTO>("/orders", {
    method: "POST",
    body: {
      items: req.cart.map((c) => ({ tipo: c.kind, id: c.id, cantidad: c.quantity })),
      direccion: {
        calle: req.address.street.trim(),
        numero: req.address.number.trim(),
        detalle: req.address.detail?.trim() || null,
        referencia: req.address.reference?.trim() || null,
        codigoPostal: req.address.postalCode?.trim() || null,
        idComuna: req.address.communeId,
        comuna: req.address.commune || null,
      },
      horarioPreferido: req.preferredSchedule || null,
      notas: req.notes?.trim() || null,
      codigoCupon: req.couponCode?.trim() || null,
    },
  });
  return toOrder(dto, client.name, client.rut);
}

/** Pedidos del portal y OT que la central creó para el cliente, con su estado en vivo. */
export async function fetchMyOrders(client: { name: string; rut: string }, signal?: AbortSignal): Promise<ClientOrder[]> {
  const list = await api<PedidoResponseDTO[]>("/orders/my-orders", { signal });
  return list.map((p) => toOrder(p, client.name, client.rut));
}

// ---- Cupones ----

export interface CouponCheck {
  codigo: string;
  valido: boolean;
  mensaje: string;
  descuento: number;
  totalConDescuento: number;
}

/** Prueba un cupón contra el subtotal del carrito (no lo consume: se aplica al confirmar). */
export async function checkCoupon(code: string, subtotal: number): Promise<CouponCheck> {
  const r = await api<CouponCheck>(
    `/promo-codes/${encodeURIComponent(code.trim())}?subtotal=${Math.max(0, Math.round(subtotal))}`
  );
  return { ...r, descuento: Number(r.descuento ?? 0), totalConDescuento: Number(r.totalConDescuento ?? subtotal) };
}

import { ClientOrder, ClientOrderItem, TrackingStep } from "@/types/order";
import { CartItem } from "@/types/product";
import { verifyAndHoldStock } from "./catalogService";

const STORAGE_KEY = "digitalfix_client_orders";

export interface CheckoutRequest {
  fullName: string;
  rut: string;
  phone: string;
  address: string;
  preferredSchedule: string;
  notes: string;
  cart: CartItem[];
  subtotal: number;
}

export function getStoredOrders(): ClientOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: ClientOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn("Error guardando órdenes en localStorage:", err);
  }
}

/**
 * Procesa el checkout de un cliente:
 * 1. Verifica y reserva stock de repuestos en ms-catalog.
 * 2. Emite la orden hacia ms-workorders / API de órdenes.
 * 3. Persiste la orden creada en el historial local del cliente.
 */
export async function createClientOrder(req: CheckoutRequest): Promise<ClientOrder> {
  // 1. Separar repuestos para verificar y reservar stock en ms-catalog
  const repuestos = req.cart.filter((item) => item.category === "Repuestos");
  if (repuestos.length > 0) {
    const holdItems = repuestos.map((r) => ({
      idRepuesto: r.id,
      cantidad: r.quantity,
    }));

    const holdResult = await verifyAndHoldStock(holdItems, `CART-${req.rut.replace(/\D/g, "")}`);
    if (!holdResult.exitoso) {
      const faltantes = holdResult.detalles
        .filter((d) => !d.disponible)
        .map((d) => `${d.nombre} (solicitados: ${d.cantidadSolicitada}, disponibles: ${d.stockDisponibleReal})`)
        .join(", ");
      throw new Error(`Stock insuficiente para repuestos: ${faltantes}`);
    }
  }

  // 2. Generar correlativo de la orden
  const numericId = Math.floor(Math.random() * 900 + 1050);
  const orderId = `DF-${numericId}`;
  const now = new Date().toISOString();

  // 3. Mapear ítems del carrito a ítems de la orden
  const items: ClientOrderItem[] = req.cart.map((c) => ({
    productId: c.id,
    code: c.code,
    name: c.name,
    category: c.category,
    quantity: c.quantity,
    unitPrice: c.price,
  }));

  const mainItem = req.cart[0];
  const serviceTitle = req.cart.length === 1
    ? mainItem.name
    : `${mainItem.name} + ${req.cart.length - 1} ítem(s) adicional(es)`;

  const trackingSteps: TrackingStep[] = [
    {
      status: "CREADA",
      label: "Orden Creada",
      subtitle: "Solicitud registrada y validada",
      timestamp: "Ahora mismo",
      completed: true,
      current: true,
    },
    {
      status: "ASIGNADA",
      label: "Técnico Asignado",
      subtitle: "Pendiente de despacho",
      completed: false,
      current: false,
    },
    {
      status: "EN_DESPLAZAMIENTO",
      label: "En Camino",
      subtitle: "Técnico en ruta",
      completed: false,
      current: false,
    },
    {
      status: "EN_EJECUCION",
      label: "En Terreno",
      subtitle: "Revisión técnica",
      completed: false,
      current: false,
    },
    {
      status: "CERRADA",
      label: "Finalizada",
      subtitle: "Certificación SEC",
      completed: false,
      current: false,
    },
  ];

  const newOrder: ClientOrder = {
    id: orderId,
    numericId,
    createdAt: now,
    status: "CREADA",
    serviceTitle,
    categoryBadge: "Urgencia SEC",
    address: req.address,
    commune: "Región Metropolitana",
    clientRut: req.rut,
    clientName: req.fullName,
    totalAmount: req.subtotal,
    deliveryDateEstimate: `Agendado: ${req.preferredSchedule}`,
    notes: req.notes,
    items,
    trackingSteps,
  };

  // 4. Intentar enviar a ms-workorders si está disponible
  try {
    await fetch("/api/ordenes-trabajo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idCliente: 1, // Cliente demo en ms-workorders
        observaciones: `[Portal Cliente] ${req.notes || serviceTitle}. Dirección: ${req.address}. Horario: ${req.preferredSchedule}. RUT: ${req.rut}`,
        servicios: [],
      }),
    });
  } catch (err) {
    console.info("ms-workorders no conectado directamente; persistiendo orden en backend cliente local:", err);
  }

  // 5. Persistir orden creada en local storage
  const current = getStoredOrders();
  saveStoredOrders([newOrder, ...current]);

  return newOrder;
}
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";
import { useOrders } from "../../../contexts/OrderContext";
import { useCatalog } from "../../../hooks/useCatalog";
import { CouponCheck, checkCoupon, createOrder } from "../../../services/orderService";
import { ApiError, errorMessage } from "../../../services/api";
import { ClientOrder } from "../../../types/order";
import { formatPrice } from "../../../utils/currency";
import { CommuneSelect, CommuneValue } from "../../ui/CommuneSelect";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrderId: string) => void;
}

const HORARIOS = [
  "Lo antes posible",
  "Hoy en la tarde (14:00 a 18:00)",
  "Mañana en la mañana (09:00 a 13:00)",
  "Coordinar por teléfono",
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { cart, subtotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { reload: reloadCatalog } = useCatalog();

  const [created, setCreated] = useState<ClientOrder | null>(null);
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [detail, setDetail] = useState("");
  const [reference, setReference] = useState("");
  const [location, setLocation] = useState<CommuneValue>({});
  const [schedule, setSchedule] = useState(HORARIOS[0]);
  const [notes, setNotes] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponCheck | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al abrir, parte desde la comuna del perfil.
  useEffect(() => {
    if (isOpen) {
      setLocation({ communeId: user?.communeId, commune: user?.commune, region: user?.region });
      setError(null);
    }
  }, [isOpen, user?.communeId, user?.commune, user?.region]);

  // Si cambia el carrito, el cupón se vuelve a probar.
  useEffect(() => setCoupon(null), [subtotal]);

  if (!isOpen || !user) return null;

  const descuento = coupon?.valido ? coupon.descuento : 0;
  const total = Math.max(0, subtotal - descuento);

  const aplicarCupon = async () => {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    try {
      setCoupon(await checkCoupon(couponInput, subtotal));
    } catch (err) {
      setCoupon({ codigo: couponInput, valido: false, mensaje: errorMessage(err), descuento: 0, totalConDescuento: subtotal });
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !number.trim()) return setError("Indica la calle y el número de la dirección de atención.");
    if (!location.communeId) return setError("Selecciona la región y la comuna de atención.");

    setLoading(true);
    setError(null);
    try {
      const order = await createOrder(
        {
          cart,
          address: {
            street,
            number,
            detail,
            reference,
            communeId: location.communeId,
            commune: location.commune,
          },
          preferredSchedule: schedule,
          notes,
          couponCode: coupon?.valido ? coupon.codigo : undefined,
        },
        { name: user.fullName, rut: user.rut }
      );
      addOrder(order);
      clearCart();
      setCreated(order);
      reloadCatalog(); // el stock reservado ya no está disponible
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? `${err.detail}. Ajusta las cantidades en el carrito e inténtalo de nuevo.`
          : errorMessage(err, "No pudimos enviar la solicitud. Inténtalo nuevamente.")
      );
    } finally {
      setLoading(false);
    }
  };

  const cerrar = () => {
    setCreated(null);
    onClose();
  };

  const verSeguimiento = () => {
    if (created) onSuccess(created.trackingCode ?? created.id);
    cerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/50 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl my-8 animate-slideUp">
        <button onClick={cerrar} className="absolute top-3 right-3 btn-ghost" aria-label="Cerrar">
          Cerrar
        </button>

        {!created ? (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200">
              <p className="eyebrow">Solicitud de atención</p>
              <h2 className="text-lg font-semibold text-slate-900 mt-1">Dirección y horario de la visita</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                A nombre de <strong className="text-slate-700">{user.fullName}</strong>
                {user.rut && <> · RUT {user.rut}</>}
              </p>
            </div>

            <div className="px-6 sm:px-8 py-5 space-y-4">
              {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label htmlFor="co-calle" className="label">
                    Calle *
                  </label>
                  <input id="co-calle" className="input" autoComplete="address-line1" value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="co-numero" className="label">
                    Número *
                  </label>
                  <input id="co-numero" className="input" value={number} onChange={(e) => setNumber(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="co-detalle" className="label">
                    Depto. u oficina
                  </label>
                  <input id="co-detalle" className="input" value={detail} onChange={(e) => setDetail(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="co-ref" className="label">
                    Indicaciones de acceso
                  </label>
                  <input
                    id="co-ref"
                    className="input"
                    placeholder="Tablero en el subterráneo"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
              </div>

              <CommuneSelect idPrefix="co" required value={location} onChange={setLocation} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="co-horario" className="label">
                    Horario preferido
                  </label>
                  <select id="co-horario" className="input" value={schedule} onChange={(e) => setSchedule(e.target.value)}>
                    {HORARIOS.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="co-cupon" className="label">
                    Cupón
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="co-cupon"
                      className="input uppercase"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCoupon(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={aplicarCupon}
                      disabled={!couponInput.trim() || checkingCoupon}
                      className="btn-secondary shrink-0"
                    >
                      {checkingCoupon ? "..." : "Aplicar"}
                    </button>
                  </div>
                  {coupon && (
                    <p className={`text-xs mt-1 ${coupon.valido ? "text-emerald-700" : "text-red-600"}`}>{coupon.mensaje}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="co-notas" className="label">
                  Comentarios para el técnico
                </label>
                <textarea
                  id="co-notas"
                  rows={2}
                  maxLength={400}
                  className="input h-auto py-2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex flex-wrap items-center justify-between gap-4">
              <dl className="text-xs text-slate-600 space-y-0.5">
                {descuento > 0 && (
                  <div className="flex gap-2">
                    <dt>Descuento</dt>
                    <dd className="tabular-nums">−{formatPrice(descuento)}</dd>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <dt>Total estimado</dt>
                  <dd className="text-lg font-bold text-slate-900 tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>
              <button type="submit" disabled={loading || cart.length === 0} className="btn-primary h-11 px-6">
                {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 space-y-6">
            <div>
              <p className="eyebrow">Solicitud recibida</p>
              <h2 className="text-xl font-semibold text-slate-900 mt-1">Tu orden ya está en la central</h2>
              <p className="text-sm text-slate-500 mt-1">
                El equipo de operaciones la ve desde ahora y te asignará una cuadrilla. Puedes seguir su avance en Mis órdenes.
              </p>
            </div>

            <dl className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-sm">
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-slate-500">Pedido</dt>
                <dd className="font-semibold text-slate-900">{created.id}</dd>
              </div>
              {created.trackingCode && (
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-slate-500">Orden de trabajo</dt>
                  <dd className="font-semibold text-brand-600">{created.trackingCode}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-slate-500">Dirección</dt>
                <dd className="text-slate-800 text-right">{created.address}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-slate-500">Total</dt>
                <dd className="font-semibold text-slate-900 tabular-nums">{formatPrice(created.totalAmount)}</dd>
              </div>
            </dl>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={verSeguimiento} className="btn-primary h-11 flex-1">
                Ver seguimiento
              </button>
              <button onClick={cerrar} className="btn-secondary h-11 flex-1">
                Volver al catálogo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

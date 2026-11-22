import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";
import { useOrders } from "../../../contexts/OrderContext";
import { createClientOrder } from "../../../services/orderService";
import { formatPrice } from "../../../utils/currency";
import { formatRut, validateRut } from "../../../utils/rutValidator";
import { Icon } from "../../ui/Icon";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { cart, subtotal, clearCart } = useCart();
  const { addOrder } = useOrders();

  const [step, setStep] = useState<"form" | "confirmation">("form");
  const [createdOrderId, setCreatedOrderId] = useState<string>("");

  const [fullName, setFullName] = useState(user?.fullName || "Comercial Rojas Ltda.");
  const [rut, setRut] = useState(user?.rut || "76.123.456-7");
  const [phone, setPhone] = useState(user?.phone || "+56 9 8765 4321");
  const [address, setAddress] = useState(user?.address || "Av. Providencia 1234, Of. 602, Providencia");
  const [preferredSchedule, setPreferredSchedule] = useState("Urgente (En menos de 2 horas)");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !rut || !address) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }
    if (!validateRut(rut)) {
      setError("El RUT ingresado no es válido.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await createClientOrder({
        fullName,
        rut,
        phone,
        address,
        preferredSchedule,
        notes,
        cart,
        subtotal,
      });

      addOrder(order);
      setCreatedOrderId(order.id);
      clearCart();
      setStep("confirmation");
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess(createdOrderId);
    onClose();
    setStep("form");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-slideUp">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
        >
          <Icon name="close" size={16} />
        </button>

        {step === "form" ? (
          <div className="p-6 sm:p-8">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[10px] font-black tracking-wider uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                PASO FINAL • DESPACHO A TERRENO
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                Coordinación de Cuadrilla Técnica
              </h2>
              <p className="text-xs text-slate-500">
                Indica la ubicación del inmueble y el horario preferente para la visita del técnico SEC.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Razón Social / Nombre de Contacto *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RUT Facturación / Inmueble *
                  </label>
                  <input
                    type="text"
                    required
                    value={rut}
                    onChange={(e) => setRut(formatRut(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono Celular de Enlace *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dirección Exacta del Inmueble / PyME *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm text-slate-800"
                  placeholder="Calle, número, depto u oficina, comuna"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horario de Atención
                  </label>
                  <select
                    value={preferredSchedule}
                    onChange={(e) => setPreferredSchedule(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-xs sm:text-sm text-slate-800 bg-white"
                  >
                    <option value="Urgente (En menos de 2 horas)">⚡ Urgente (&lt; 2 horas)</option>
                    <option value="Hoy en la tarde (14:00 - 18:00)">Hoy en la tarde (14:00 - 18:00)</option>
                    <option value="Mañana en la mañana (09:00 - 13:00)">Mañana en la mañana (09:00 - 13:00)</option>
                    <option value="Coordinar telefónicamente">Coordinar telefónicamente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Indicaciones Adicionales
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-xs sm:text-sm text-slate-800"
                    placeholder="Ej: Tablero en subsuelo..."
                  />
                </div>
              </div>

              {/* Resumen de pago */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Total Estimado</span>
                  <strong className="text-xl font-black text-slate-950">
                    {formatPrice(subtotal)}
                  </strong>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-slate-950 hover:bg-blue-600 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2"
                >
                  {loading ? (
                    <span>Confirmando Orden...</span>
                  ) : (
                    <>
                      <span>Confirmar y Enviar Cuadrilla</span>
                      <Icon name="check" size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* PANTALLA DE CONFIRMACIÓN (Idéntica a la pantalla inferior izquierda de la imagen del usuario) */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-500 border-4 border-emerald-100 flex items-center justify-center text-3xl shadow-sm">
              <Icon name="check" size={40} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                ¡SOLICITUD EXITOSA!
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Tu Orden fue Creada y Transmitida
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hemos asignado tu requerimiento a la central de despacho. Ya puedes
                seguir el estado del técnico en camino en tiempo real.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 max-w-sm mx-auto space-y-1">
              <div className="flex justify-between font-bold">
                <span>N° de Orden:</span>
                <span className="text-blue-600 font-black">{createdOrderId}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Dirección de visita:</span>
                <span className="truncate max-w-[200px]">{address}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Horario coordinado:</span>
                <span className="font-semibold text-emerald-700">{preferredSchedule}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleFinish}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <Icon name="truck" size={16} />
                <span>Rastrear Orden en Vivo</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition"
              >
                Volver al Catálogo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

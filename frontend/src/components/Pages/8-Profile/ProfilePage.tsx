import React, { ReactNode } from "react";
import { useAuth } from "../../../contexts/AuthContext";

interface ProfilePageProps {
  /** Opcional: si se entrega, se muestra el acceso directo a "Mis órdenes". */
  onOpenOrderTracking?: () => void;
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const AccountSection: React.FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <section className="bg-white rounded-lg shadow-sm">
    <h2 className="px-6 py-4 text-base font-semibold text-slate-900 border-b border-sky-100">
      {title}
    </h2>
    <div className="divide-y divide-sky-100">{children}</div>
  </section>
);

interface InfoRowProps {
  label: string;
  value: string;
  actionLabel?: string;
  onAction?: () => void;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, actionLabel, onAction }) => (
  <div className="px-6 py-4 flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-900 mt-0.5 break-words">{value}</p>
    </div>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 text-sm text-blue-600 hover:text-blue-700 transition"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

interface PaymentMethod {
  id: string;
  brand: string;
  title: string;
  detail: string;
  isDefault?: boolean;
}

// DATOS DE PRUEBA: mover a /mocks cuando exista el módulo de pagos.
const DEMO_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm-1", brand: "VISA", title: "Tarjeta de crédito Visa", detail: "•••• 4242 · Vence 09/2028", isDefault: true },
  { id: "pm-2", brand: "MC", title: "Tarjeta de débito Mastercard", detail: "•••• 1180 · Vence 03/2027" },
  { id: "pm-3", brand: "TEF", title: "Transferencia electrónica", detail: "Pago contra factura a 30 días" },
];

const PaymentRow: React.FC<{ method: PaymentMethod }> = ({ method }) => (
  <div className="px-6 py-4 flex items-center gap-4">
    <div
      aria-hidden="true"
      className="w-12 h-8 shrink-0 rounded border border-sky-100 bg-sky-50 flex items-center justify-center text-[10px] font-semibold tracking-wide text-blue-700"
    >
      {method.brand}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm text-slate-900">{method.title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{method.detail}</p>
    </div>
    {method.isDefault && (
      <span className="shrink-0 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
        Principal
      </span>
    )}
  </div>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenOrderTracking }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // TODO: conectar con los formularios de edición cuando existan.
  const edit = () => {};

  return (
    <div className="bg-sky-50/60 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <h1 className="text-xl font-semibold text-slate-900 px-1">Mi cuenta</h1>

        {/* Resumen */}
        <section className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
          <div
            aria-hidden="true"
            className="w-14 h-14 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold"
          >
            {getInitials(user.fullName)}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-slate-900 truncate">{user.fullName}</p>
            <p className="text-sm text-slate-500">RUT {user.rut}</p>
          </div>
        </section>

        {/* Acceso a órdenes (solo si el padre lo habilita) */}
        {onOpenOrderTracking && (
          <section className="bg-white rounded-lg shadow-sm px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Mis órdenes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Revisa el estado de tus solicitudes y servicios en curso.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenOrderTracking}
              className="shrink-0 h-10 px-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
            >
              Ver órdenes
            </button>
          </section>
        )}

        {/* Datos de la cuenta */}
        <AccountSection title="Datos de la cuenta">
          <InfoRow label="Razón social o nombre" value={user.fullName} actionLabel="Modificar" onAction={edit} />
          <InfoRow label="RUT" value={user.rut} />
          <InfoRow label="Correo electrónico" value={user.email} actionLabel="Modificar" onAction={edit} />
          <InfoRow label="Teléfono de contacto" value={user.phone} actionLabel="Modificar" onAction={edit} />
        </AccountSection>

        {/* Dirección */}
        <AccountSection title="Dirección de facturación y servicio">
          <InfoRow label="Dirección principal" value={user.address} actionLabel="Modificar" onAction={edit} />
        </AccountSection>

        {/* Seguridad */}
        <AccountSection title="Seguridad">
          <InfoRow label="Contraseña" value="••••••••••" actionLabel="Cambiar" onAction={edit} />
        </AccountSection>

        {/* Métodos de pago */}
        <AccountSection title="Métodos de pago">
          {DEMO_PAYMENT_METHODS.map((m) => (
            <PaymentRow key={m.id} method={m} />
          ))}
          <div className="px-6 py-4">
            <button
              type="button"
              onClick={edit}
              className="h-10 px-5 rounded-md border border-blue-600 text-blue-700 hover:bg-blue-50 text-sm font-semibold transition"
            >
              Modificar métodos de pago
            </button>
          </div>
        </AccountSection>

        {/* Cierre de sesión */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={logout}
            className="h-10 px-5 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-600 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};
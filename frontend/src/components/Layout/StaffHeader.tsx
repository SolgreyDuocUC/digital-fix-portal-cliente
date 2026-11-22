import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { SystemRole } from "../../types/commercial";
import { Brand } from "../ui/Brand";

const ROL_ETIQUETA: Record<SystemRole, string> = {
  CLIENTE: "Cliente",
  VENDEDOR: "Vendedor",
  ASISTENTE_MARKETING: "Marketing",
  JEFE_VENTAS: "Jefe de ventas",
};

const iniciales = (nombre: string) => {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
};

/** Barra superior de las vistas internas (vendedor, marketing, jefatura): marca, persona y salida. */
export const StaffHeader: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Brand />
          <span className="hidden sm:inline badge bg-brand-50 text-brand-700 border border-brand-200">
            {ROL_ETIQUETA[user.role]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {iniciales(user.fullName)}
            </span>
            <span className="hidden md:flex flex-col leading-tight min-w-0">
              <span className="text-[13px] font-semibold text-slate-900 truncate max-w-[180px]">{user.fullName}</span>
              <span className="text-[11px] text-slate-500 truncate max-w-[180px]">{user.email}</span>
            </span>
          </div>
          <button onClick={logout} className="btn-secondary">
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
};

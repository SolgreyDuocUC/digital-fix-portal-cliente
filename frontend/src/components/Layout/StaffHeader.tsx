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
  return (
    (partes[0]?.[0] ?? "") +
    (partes.length > 1 ? partes[partes.length - 1][0] : "")
  ).toUpperCase();
};

/** Barra superior de las vistas internas (vendedor, marketing, jefatura): marca, persona y salida. */
export const StaffHeader: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-brand-600 text-white shadow-xs border-b border-brand-700">
      <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between gap-4">
        {/* Izquierda: Marca + Identificador de portal interno */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="shrink-0">
            <Brand />
          </div>

          <div className="hidden sm:block h-5 w-px bg-brand-500/60" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="badge bg-brand-700/90 text-brand-50 border border-brand-500/60">
              {ROL_ETIQUETA[user.role]}
            </span>
            <span className="hidden lg:inline text-[12px] text-brand-200 font-medium">
              Portal Interno
            </span>
          </div>
        </div>

        {/* Derecha: Perfil de usuario + Cerrar sesión */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-md bg-white text-brand-700 text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
              {iniciales(user.fullName)}
            </span>
            <span className="hidden md:flex flex-col leading-tight min-w-0">
              <span className="text-[13px] font-semibold text-white truncate max-w-[180px]">
                {user.fullName}
              </span>
              <span className="text-[11px] text-brand-200 truncate max-w-[180px]">
                {user.email}
              </span>
            </span>
          </div>

          <div className="h-5 w-px bg-brand-500/60 mx-0.5" />

          <button
            onClick={logout}
            className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg bg-brand-700 hover:bg-brand-800 border border-brand-500/50 text-white text-[13px] font-semibold transition-all duration-150 active:scale-[0.99] cursor-pointer whitespace-nowrap"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
};
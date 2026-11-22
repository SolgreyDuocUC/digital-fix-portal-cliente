import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SystemRole } from "@/types/commercial";

interface RoleSwitcherBarProps {
  onRoleChanged?: (role: SystemRole) => void;
}

const ROLES: { role: SystemRole; label: string; detalle: string }[] = [
  { role: "CLIENTE", label: "Cliente", detalle: "Tienda y seguimiento" },
  { role: "VENDEDOR", label: "Vendedor", detalle: "Cotizaciones" },
  { role: "ASISTENTE_MARKETING", label: "Marketing", detalle: "Promociones y catálogo" },
  { role: "JEFE_VENTAS", label: "Jefe de ventas", detalle: "Aprobaciones y KPIs" },
];

/**
 * Selector de perfil para demostraciones. No es fijo (se desplaza con la página) para no
 * superponerse con el encabezado, y usa el mismo control segmentado neutro en todos los roles.
 */
export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ onRoleChanged }) => {
  const { user, switchRole } = useAuth();
  const currentRole = user?.role || "CLIENTE";

  const seleccionar = (role: SystemRole) => {
    switchRole(role);
    onRoleChanged?.(role);
  };

  return (
    <div className="bg-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow">Vista de demostración</span>
        <div className="flex flex-wrap gap-1 p-0.5 rounded-lg bg-white border border-slate-200" role="radiogroup" aria-label="Ver el portal como">
          {ROLES.map((r) => {
            const activo = currentRole === r.role;
            return (
              <button
                key={r.role}
                role="radio"
                aria-checked={activo}
                title={r.detalle}
                onClick={() => seleccionar(r.role)}
                className={`h-7 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activo ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Brand } from "../ui/Brand";

const SERVICES = [
  "Emergencias 24/7",
  "Mantención de Tableros TDA/TG",
  "Termografía Infrarroja",
  "Certificación SEC (TE1)",
  "Grupos Electrógenos & TTA",
];

const PARTS = [
  "Disyuntores Diferenciales",
  "Automáticos Legrand & Schneider",
  "Cables Libres de Halógeno",
  "Equipos Iluminación LED",
  "Barras de Distribución Tetrapolar",
];

const BRANCHES = [
  { region: "Región de Valparaíso", cities: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Felipe", "Los Andes"] },
  { region: "Región Metropolitana", cities: ["Santiago Centro"] },
  { region: "Región de O'Higgins", cities: ["Rancagua"] },
  { region: "Región de Coquimbo", cities: ["La Serena"] },
];

const linkClass = "text-slate-500";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10">
        {/* Marca */}
        <div className="lg:col-span-3 space-y-3">
          <Brand />
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
            Mantención eléctrica, certificación TE1 y servicio en terreno para
            empresas e inmuebles, con 9 sucursales en 4 regiones.
          </p>
        </div>

        {/* Servicios */}
        <div className="lg:col-span-2">
          <h4 className="eyebrow mb-3">Servicios</h4>
          <ul className="space-y-2 text-xs">
            {SERVICES.map((s) => (
              <li key={s} className={linkClass}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Repuestos */}
        <div className="lg:col-span-3">
          <h4 className="eyebrow mb-3">Repuestos y materiales</h4>
          <ul className="space-y-2 text-xs">
            {PARTS.map((p) => (
              <li key={p} className={linkClass}>{p}</li>
            ))}
          </ul>
        </div>

        {/* Sucursales */}
        <div className="lg:col-span-4">
          <h4 className="eyebrow mb-3">Sucursales</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
            {BRANCHES.map((b) => (
              <div key={b.region}>
                <p className="font-semibold text-slate-700 mb-1.5">{b.region}</p>
                <ul className="space-y-1.5">
                  {b.cities.map((c) => (
                    <li key={c} className={linkClass}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Franja inferior */}
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-5 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3">
          <p>© 2026 DigitalFix SpA. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <span className={linkClass}>Términos de servicio</span>
            <span className={linkClass}>Políticas de privacidad</span>
            <span className={linkClass}>Protocolo SEC RIC N°02</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
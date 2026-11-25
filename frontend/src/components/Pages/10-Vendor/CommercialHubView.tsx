import React from "react";
import { QuickAccessList, QuickAccessItem } from "@/components/ui/QuickAccessList";

export type VendorSubView =
  | "hub"
  | "quotes"
  | "create-quote"
  | "enrichment"
  | "reviews"
  | "kpis";

interface CommercialHubViewProps {
  onNavigate: (viewId: Exclude<VendorSubView, "hub">) => void;
}

export const CommercialHubView: React.FC<CommercialHubViewProps> = ({ onNavigate }) => {
  const quickAccessItems: QuickAccessItem[] = [
    {
      id: "quotes",
      title: "Solicitudes de Cotización",
      description: "Listado completo, costeo técnico y seguimiento de cotizaciones hacia operaciones.",
      onClick: () => onNavigate("quotes"),
    },
    {
      id: "create-quote",
      title: "Registro de Nueva Solicitud",
      description: "Formulario para registrar cliente, comuna, servicios y repuestos técnicos.",
      onClick: () => onNavigate("create-quote"),
    },
    {
      id: "enrichment",
      title: "Catálogo e Imágenes Comerciales",
      description: "Asignación de fotografías desde Google Drive, descripción y revisión de restricciones.",
      onClick: () => onNavigate("enrichment"),
    },
    {
      id: "reviews",
      title: "Reseñas y Oportunidades de Mejora",
      description: "Monitoreo del feedback de clientes post-servicio y planes de acción.",
      onClick: () => onNavigate("reviews"),
    },
    {
      id: "kpis",
      title: "KPIs y Desempeño Comercial",
      description: "Resumen ejecutivo de conversión de ventas, SLA de cuadrillas y demanda por comuna.",
      onClick: () => onNavigate("kpis"),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="panel p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="eyebrow">Módulo del Sistema</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Ventas y Operaciones Comerciales
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Controla solicitudes de cotización, catálogo operativo, servicios en terreno y seguimiento integral de clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("quotes")}
          className="btn-primary h-10 px-5 shrink-0"
        >
          Acceder al módulo
        </button>
      </section>

      <QuickAccessList items={quickAccessItems} />
    </div>
  );
};

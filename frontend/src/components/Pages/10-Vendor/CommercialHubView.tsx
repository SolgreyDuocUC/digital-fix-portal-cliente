import React from "react";

interface CommercialHubViewProps {
  onNavigate: (viewId: "quotes" | "create-quote" | "enrichment" | "reviews" | "kpis") => void;
}

export const CommercialHubView: React.FC<CommercialHubViewProps> = ({ onNavigate }) => {
  const quickAccessItems = [
    {
      id: "quotes",
      title: "Solicitudes de Cotización",
      subtitle: "Listado completo, costeo técnico y gestión de todas las cotizaciones internas hacia operaciones.",
      icon: "fileText",
      action: () => onNavigate("quotes"),
    },
    {
      id: "create-quote",
      title: "Registro de Nueva Solicitud",
      subtitle: "Formulario ágil de especificaciones, cliente, asesor, comuna y switches técnicos.",
      icon: "plus",
      action: () => onNavigate("create-quote"),
    },
    {
      id: "enrichment",
      title: "Catálogo & Marketing de Productos y Servicios",
      subtitle: "Enriquecimiento con imágenes obligatorias (Google Drive), promociones y restricciones zonales.",
      icon: "package",
      action: () => onNavigate("enrichment"),
    },
    {
      id: "reviews",
      title: "Reseñas, Críticas y Oportunidades de Mejora",
      subtitle: "Monitoreo del feedback de clientes, métricas de satisfacción y planes de acción para cuadrillas.",
      icon: "star",
      action: () => onNavigate("reviews"),
    },
    {
      id: "kpis",
      title: "Dashboard y KPIs Gerenciales",
      subtitle: "Resumen ejecutivo del área comercial: conversión de ventas, SLA de cuadrillas y demanda por comuna.",
      icon: "shield-check",
      action: () => onNavigate("kpis"),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* TARJETA SUPERIOR: Módulo del Sistema (Inspirado en Imagen 3) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            Módulo del Sistema
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Ventas y Operaciones Comerciales
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Controla solicitudes de cotización, catálogo operativo, servicios en terreno, enriquecimiento publicitario de repuestos y seguimiento integral de clientes.
          </p>
        </div>

        <div>
          <button
            onClick={() => onNavigate("quotes")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            Acceder al módulo
          </button>
        </div>
      </div>

      {/* SECCIÓN: Accesos Rápidos (Tarjetas horizontales de Imagen 3) */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Accesos Rápidos
        </h2>

        <div className="space-y-3">
          {quickAccessItems.map((item) => (
            <div
              key={item.id}
              onClick={item.action}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex items-center justify-between gap-4 hover:border-blue-400 hover:shadow-sm transition cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Ingresar</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


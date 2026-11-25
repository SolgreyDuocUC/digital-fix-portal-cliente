import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { SystemRole } from "../../types/commercial";

export type ExecutiveSection =
  | "ventas-pedidos"
  | "ventas-clientes"
  | "mkt-campanas"
  | "mkt-catalogo"
  | "mkt-resenas"
  | "jefatura-aprobaciones"
  | "jefatura-reportes"
  | "mi-perfil";

interface ExecutiveShellProps {
  activeSection: ExecutiveSection;
  onSelectSection: (section: ExecutiveSection) => void;
  children: React.ReactNode;
}

const ROL_ETIQUETA: Record<SystemRole, string> = {
  CLIENTE: "Cliente",
  VENDEDOR: "Ejecutivo de Ventas",
  ASISTENTE_MARKETING: "Asistente de Marketing",
  JEFE_VENTAS: "Jefe de Ventas y Operaciones",
};

type NavGroup = "Ventas" | "Marketing" | "Jefatura" | "Mi espacio";

interface NavOption {
  id: ExecutiveSection;
  label: string;
  group: NavGroup;
  roles: SystemRole[];
}

const GROUP_ORDER: NavGroup[] = ["Ventas", "Marketing", "Jefatura", "Mi espacio"];

const MENU_ITEMS: NavOption[] = [
  // Ventas
  { id: "ventas-pedidos", label: "Órdenes y Cotizaciones", group: "Ventas", roles: ["VENDEDOR", "JEFE_VENTAS"] },
  { id: "ventas-clientes", label: "Cartera de Clientes", group: "Ventas", roles: ["VENDEDOR", "JEFE_VENTAS"] },

  // Marketing (Submenús desplegables en el sidebar)
  { id: "mkt-campanas", label: "Campañas y Promociones", group: "Marketing", roles: ["ASISTENTE_MARKETING", "JEFE_VENTAS"] },
  { id: "mkt-catalogo", label: "Fichas e Imágenes", group: "Marketing", roles: ["ASISTENTE_MARKETING", "JEFE_VENTAS"] },
  { id: "mkt-resenas", label: "Reseñas de Clientes", group: "Marketing", roles: ["ASISTENTE_MARKETING", "JEFE_VENTAS"] },

  // Jefatura
  { id: "jefatura-aprobaciones", label: "Aprobación de Campañas", group: "Jefatura", roles: ["JEFE_VENTAS"] },
  { id: "jefatura-reportes", label: "Resumen Comercial", group: "Jefatura", roles: ["JEFE_VENTAS"] },

  // Mi espacio
  { id: "mi-perfil", label: "Mi Cuenta y Seguridad", group: "Mi espacio", roles: ["VENDEDOR", "ASISTENTE_MARKETING", "JEFE_VENTAS"] },
];

const saludo = () => {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 20) return "Buenas tardes";
  return "Buenas noches";
};

const FOCO_SOBRE_AZUL = "focus-visible:outline-white focus-visible:outline-offset-[-2px]";

export const ExecutiveShell: React.FC<ExecutiveShellProps> = ({
  activeSection,
  onSelectSection,
  children,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Controla qué submenús (acordeones) están desplegados en el sidebar
  const [openGroups, setOpenGroups] = useState<Record<NavGroup, boolean>>({
    Ventas: true,
    Marketing: true,
    Jefatura: true,
    "Mi espacio": true,
  });

  // Asegura que el grupo de la sección activa siempre esté abierto
  useEffect(() => {
    const activeItem = MENU_ITEMS.find((i) => i.id === activeSection);
    if (activeItem) {
      setOpenGroups((prev) => ({ ...prev, [activeItem.group]: true }));
    }
  }, [activeSection]);

  if (!user) return null;

  const nombreSaludo =
    user.firstName?.trim() ||
    user.fullName?.trim().split(/\s+/)[0] ||
    user.email.split("@")[0];

  const nombreCompleto =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.fullName ||
    nombreSaludo;

  const visibleItems = MENU_ITEMS.filter((item) => item.roles.includes(user.role));
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: visibleItems.filter((item) => item.group === group),
  })).filter((g) => g.items.length > 0);

  const toggleGroup = (group: NavGroup) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleNav = (id: ExecutiveSection) => {
    onSelectSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-[#f4f7fb] text-slate-900">
      {/* Barra superior móvil */}
      <div className="lg:hidden sticky top-0 z-40 bg-brand-600 text-white px-4 h-14 flex items-center justify-between border-b border-brand-700">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-sm font-bold tracking-tight text-white">DigitalFix</span>
          <span className="badge bg-brand-700 text-brand-50 border border-brand-500/50 truncate">
            {ROL_ETIQUETA[user.role]}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-expanded={mobileMenuOpen}
          aria-controls="menu-ejecutivo"
          className={`px-3 h-8 rounded-lg bg-brand-700 hover:bg-brand-800 text-xs font-semibold cursor-pointer transition-colors ${FOCO_SOBRE_AZUL}`}
        >
          {mobileMenuOpen ? "Cerrar" : "Menú"}
        </button>
      </div>

      {/* Overlay móvil */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Corporativo Azul Institucional */}
      <aside
        id="menu-ejecutivo"
        className={`fixed lg:sticky top-0 left-0 z-40 h-dvh w-64 shrink-0 bg-brand-600 text-white flex flex-col justify-between transition-transform duration-200 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Bloque de identidad del ejecutivo */}
          <div className="px-4 pt-5 pb-4 border-b border-brand-500/40">
            <div className="rounded-xl bg-brand-700/60 border border-brand-500/30 px-3.5 py-3">
              <p className="text-[13px] font-bold text-white truncate">{nombreCompleto}</p>
              <p className="text-xs text-brand-100 truncate mt-0.5">{ROL_ETIQUETA[user.role]}</p>
            </div>
          </div>

          {/* Navegación con Submenús Desplegables (Acordeón corporativo) */}
          <nav aria-label="Menú ejecutivo" className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            {groups.map(({ group, items }) => {
              const isOpen = openGroups[group];
              const hasActiveChild = items.some((i) => i.id === activeSection);

              return (
                <div
                  key={group}
                  className="rounded-xl overflow-hidden border border-brand-500/30 bg-brand-700/30"
                >
                  {/* Cabecera desplegable del módulo */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    aria-expanded={isOpen}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${FOCO_SOBRE_AZUL} ${
                      hasActiveChild
                        ? "bg-brand-700/80 text-white"
                        : "text-brand-100 hover:bg-brand-700/50 hover:text-white"
                    }`}
                  >
                    <span>{group}</span>
                    <span className="text-sm font-mono leading-none opacity-80">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {/* Sub-opciones blancas estilo tarjeta corporativa */}
                  {isOpen && (
                    <div className="bg-white divide-y divide-slate-100">
                      {items.map((item) => {
                        const active = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNav(item.id)}
                            aria-current={active ? "page" : undefined}
                            className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer block ${
                              active
                                ? "bg-brand-500 text-white font-semibold"
                                : "text-slate-700 hover:bg-slate-50 hover:text-brand-700 font-medium"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Inferior: cerrar sesión */}
        <div className="p-4 border-t border-brand-500/40">
          <button
            type="button"
            onClick={logout}
            className={`w-full h-9 px-3 rounded-lg bg-brand-700 hover:bg-brand-800 border border-brand-500/50 text-white text-xs font-semibold transition-colors cursor-pointer text-center ${FOCO_SOBRE_AZUL}`}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Área de trabajo */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Encabezado de escritorio */}
        <header className="hidden lg:flex bg-[var(--color-superficie)] border-b border-slate-200 h-16 px-8 items-center justify-between">
          <p className="text-[15px] font-semibold text-slate-900 leading-tight truncate">
            {saludo()}, {nombreSaludo}
          </p>
          <span className="text-xs text-slate-500 truncate">{user.email}</span>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
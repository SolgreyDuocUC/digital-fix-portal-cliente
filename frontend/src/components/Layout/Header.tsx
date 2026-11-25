import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { CatalogView } from "../../types/catalog";
import { Brand } from "../ui/Brand";

type Tab = "catalog" | "my-orders" | "profile" | "marketing";

interface HeaderProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  catalogView: CatalogView;
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onBrowse: (category: string) => void;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

const iniciales = (nombre: string) => {
  const partes = nombre.trim().split(/\s+/);
  return (
    (partes[0]?.[0] ?? "") +
    (partes.length > 1 ? partes[partes.length - 1][0] : "")
  ).toUpperCase();
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  search,
  onSearchChange,
  selectedCategory,
  onBrowse,
  onOpenCart,
  onOpenLogin,
  onOpenRegister,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { cartCount, subtotal } = useCart();

  // Pestañas principales estilo Movistar (Título + Subtítulo descriptivo)
  const navItems = [
    {
      id: "all",
      title: "Catálogo",
      subtitle: "Todos los servicios",
      active: currentTab === "catalog" && selectedCategory === "Todos",
      onClick: () => {
        onTabChange("catalog");
        onBrowse("Todos");
      },
    },
    {
      id: "parts",
      title: "Repuestos",
      subtitle: "Envío y retiro",
      active: currentTab === "catalog" && selectedCategory === "Repuestos",
      onClick: () => {
        onTabChange("catalog");
        onBrowse("Repuestos");
      },
    },
    {
      id: "marketing",
      title: "Planes y Ofertas",
      subtitle: "Garantía 6 meses",
      active: currentTab === "marketing",
      onClick: () => onTabChange("marketing"),
    },
    {
      id: "orders",
      title: "Mis Órdenes",
      subtitle: "Estado en línea",
      active: currentTab === "my-orders",
      onClick: () => onTabChange("my-orders"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-600 text-white shadow-sm">
      {/* Barra única principal */}
      <div className="max-w-7xl mx-auto px-4 pt-2 flex items-end justify-between gap-4">
        {/* 1. Marca (centrada verticalmente respecto a la barra) */}
        <div className="pb-3 shrink-0">
          {/* Nota: Asegúrate de que Brand acepte variante clara o luzca bien sobre fondo #005187 */}
          <Brand onClick={() => onTabChange("catalog")} />
        </div>

        {/* 2. Pestañas centrales estilo carpeta invertida (Inspiración Movistar) */}
        <nav
          className="hidden lg:flex items-end gap-1 overflow-x-auto no-scrollbar"
          aria-label="Navegación principal"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              aria-current={item.active ? "page" : undefined}
              className={`px-4 py-2.5 rounded-t-xl text-left transition-colors cursor-pointer shrink-0 ${
                item.active
                  ? "bg-[#f4f7fb] text-brand-700"
                  : "text-white/90 hover:bg-brand-700/70 hover:text-white"
              }`}
            >
              <div className="text-[13px] font-bold leading-tight">
                {item.title}
              </div>
              <div
                className={`text-[11px] leading-tight mt-0.5 ${
                  item.active ? "text-slate-600 font-medium" : "text-brand-200"
                }`}
              >
                {item.subtitle}
              </div>
            </button>
          ))}
        </nav>

        {/* 3. Acciones derechas: Cuenta + Carrito */}
        <div className="pb-2.5 flex items-center gap-2 shrink-0">
          {!isAuthenticated ? (
            <>
              <button
                onClick={onOpenLogin}
                className="px-3 h-9 rounded-lg text-[13px] font-semibold text-white hover:bg-brand-700 transition-colors cursor-pointer"
              >
                Ingresar
              </button>
              <button
                onClick={onOpenRegister}
                className="hidden sm:inline-flex items-center px-3.5 h-9 rounded-lg bg-white text-brand-700 hover:bg-brand-50 text-[13px] font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Crear cuenta
              </button>
            </>
          ) : (
            user && (
              <button
                onClick={() => onTabChange("profile")}
                className={`flex items-center gap-2 px-2.5 h-9 rounded-lg transition-colors cursor-pointer ${
                  currentTab === "profile"
                    ? "bg-brand-800 text-white"
                    : "hover:bg-brand-700 text-white"
                }`}
              >
                <span className="w-6 h-6 rounded-md bg-white text-brand-700 text-[11px] font-bold flex items-center justify-center">
                  {iniciales(user.fullName)}
                </span>
                <span className="hidden xl:inline text-[13px] font-semibold max-w-[110px] truncate">
                  {user.fullName.split(" ")[0]}
                </span>
              </button>
            )
          )}

          {/* Carrito compacto sobre fondo azul */}
          <button
            onClick={onOpenCart}
            aria-label={`Carrito, ${cartCount} ítems`}
            className="flex items-center gap-2 h-9 px-3 rounded-lg bg-brand-700 hover:bg-brand-800 border border-brand-500/50 text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            <span>Carrito</span>
            <span
              className={`min-w-5 h-5 px-1.5 rounded-md text-[11px] font-bold flex items-center justify-center ${
                cartCount > 0
                  ? "bg-white text-brand-700"
                  : "bg-brand-800 text-brand-200"
              }`}
            >
              {cartCount}
            </span>
            {subtotal > 0 && (
              <span className="hidden sm:inline text-brand-100 font-medium tabular-nums pl-1.5 border-l border-brand-500/60">
                ${subtotal.toLocaleString("es-CL")}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub-barra sutil solo para búsqueda y navegación móvil */}
      <div className="bg-[#f4f7fb] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Navegación rápida en móvil/tablet */}
          <div className="flex lg:hidden items-center gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`nav-pill ${
                  item.active ? "nav-pill-active" : "nav-pill-idle"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Dato de confianza discreto en desktop */}
          <span className="hidden lg:inline text-[12px] text-slate-600 font-medium">
            Central 24/7: <strong className="text-slate-900">+56 9 8765 4321</strong> · Técnicos certificados SEC
          </span>

          {/* Buscador compacto a la derecha */}
          <form
            className="flex-1 lg:flex-initial lg:w-80"
            onSubmit={(e) => {
              e.preventDefault();
              onTabChange("catalog");
            }}
          >
            <div className="search-group !h-[34px] !bg-white">
              <input
                type="search"
                placeholder="Buscar servicio o repuesto..."
                aria-label="Buscar en el catálogo"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => onTabChange("catalog")}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="px-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ×
                </button>
              )}
              <button
                type="submit"
                className="h-[24px] px-2.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-semibold cursor-pointer"
              >
                Ir
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};
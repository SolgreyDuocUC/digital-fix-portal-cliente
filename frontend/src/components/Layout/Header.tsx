import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useCatalog } from "../../hooks/useCatalog";
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
  /** "Todos", una categoría de servicios o "Repuestos". */
  onBrowse: (category: string) => void;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

/** Máximo de categorías de servicio en la barra; el resto se alcanza desde la página de servicios. */
const MAX_CATEGORIAS = 6;

/** Iniciales para el avatar (sin imágenes ni íconos). */
const iniciales = (nombre: string) => {
  const partes = nombre.trim().split(/\s+/);
  return (
    (partes[0]?.[0] ?? "") +
    (partes.length > 1 ? partes[partes.length - 1][0] : "")
  ).toUpperCase();
};

/**
 * Encabezado del portal: mismo patrón que la barra superior del portal de empleados.
 * Barra institucional delgada · barra blanca con marca, búsqueda y cuenta · pestañas de categorías.
 */
export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  catalogView,
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
  const { serviceCategories } = useCatalog();

  // Inicio, Servicios y Repuestos ya están en las pestañas del catálogo: aquí van solo las categorías reales.
  const categorias = serviceCategories
    .slice(0, MAX_CATEGORIAS)
    .map((c) => ({ id: c, label: c }));

  const categoriaActiva = (id: string) =>
    currentTab === "catalog" &&
    catalogView === "services" &&
    selectedCategory === id;

  const enlaceSuperior = (activo: boolean) =>
    `transition-colors cursor-pointer ${activo ? "text-white font-semibold" : "text-brand-100 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-40">
      {/* 1. Barra institucional */}
      <div className="bg-brand-600 text-[12px]">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <a
              href="tel:+56987654321"
              className="hidden sm:block text-brand-100 hover:text-white transition-colors"
            >
              Central 24/7: +56 9 8765 4321
            </a>
            <button
              onClick={() => onTabChange("my-orders")}
              className={enlaceSuperior(currentTab === "my-orders")}
            >
              Seguimiento de órdenes
            </button>
            <button
              onClick={() => onTabChange("marketing")}
              className={enlaceSuperior(currentTab === "marketing")}
            >
              Marketing
            </button>
          </div>
          <span className="hidden sm:block text-brand-100">
            Servicio certificado SEC · Garantía de 6 meses
          </span>
        </div>
      </div>

      {/* 2. Marca, búsqueda y cuenta */}
      <div className="bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4 lg:gap-8">
          <div className="shrink-0">
            <Brand onClick={() => onTabChange("catalog")} />
          </div>

          <form
            className="hidden md:flex flex-1 min-w-0 max-w-2xl gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onTabChange("catalog");
            }}
          >
            <input
              type="search"
              placeholder="Buscar servicios o repuestos"
              aria-label="Buscar en el catálogo"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => onTabChange("catalog")}
              className="input"
            />
            <button type="submit" className="btn-primary">
              Buscar
            </button>
          </form>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
            {!isAuthenticated && (
              <>
                <button
                  onClick={onOpenRegister}
                  className="hidden lg:inline-flex btn-ghost"
                >
                  Crear cuenta
                </button>
                <button onClick={onOpenLogin} className="btn-secondary">
                  Ingresar
                </button>
              </>
            )}

            {isAuthenticated && user && (
              <button
                onClick={() => onTabChange("profile")}
                className={`flex items-center gap-2.5 pr-3 border-r border-slate-200 cursor-pointer ${
                  currentTab === "profile"
                    ? "text-brand-600"
                    : "text-slate-800 hover:text-brand-600"
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {iniciales(user.fullName)}
                </span>
                <span className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-[13px] font-semibold max-w-[140px] truncate">
                    {user.fullName}
                  </span>
                  <span className="text-[11px] text-slate-500">Mi cuenta</span>
                </span>
              </button>
            )}

            <button
              onClick={() => onTabChange("my-orders")}
              className={`hidden sm:inline-flex text-[13px] font-semibold px-2 cursor-pointer ${
                currentTab === "my-orders"
                  ? "text-brand-600"
                  : "text-slate-700 hover:text-brand-600"
              }`}
            >
              Mis órdenes
            </button>

            <button
              onClick={onOpenCart}
              className="btn-secondary"
              aria-label={`Carrito, ${cartCount} ítems`}
            >
              <span>Carrito</span>
              <span
                className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  cartCount > 0
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {cartCount}
              </span>
              {subtotal > 0 && (
                <span className="hidden lg:inline text-slate-500 font-medium tabular-nums">
                  ${subtotal.toLocaleString("es-CL")}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Búsqueda en teléfono */}
        <form
          className="md:hidden px-4 pb-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onTabChange("catalog");
          }}
        >
          <input
            type="search"
            placeholder="Buscar servicios o repuestos"
            aria-label="Buscar en el catálogo"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => onTabChange("catalog")}
            className="input text-base"
          />
          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </form>
      </div>

      {/* 3. Categorías como pestañas */}
      {categorias.length > 0 && (
        <nav
          className="bg-white border-b border-slate-200"
          aria-label="Categorías"
        >
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
            {categorias.map((c) => {
              const activa = categoriaActiva(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => onBrowse(c.id)}
                  aria-current={activa ? "page" : undefined}
                  className={`relative shrink-0 px-3 h-11 text-[13px] whitespace-nowrap transition-colors cursor-pointer ${
                    activa
                      ? "text-brand-600 font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {c.label}
                  {activa && (
                    <span className="absolute left-3 right-3 bottom-0 h-0.5 rounded-full bg-brand-600" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};

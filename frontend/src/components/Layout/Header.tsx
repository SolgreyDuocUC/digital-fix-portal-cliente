
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { Brand } from "../ui/Brand";
import { Icon } from "../ui/Icon";

interface HeaderProps {
  currentTab: "catalog" | "my-orders" | "profile";
  onTabChange: (tab: "catalog" | "my-orders" | "profile") => void;
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenCart: () => void;
  onOpenLogin: () => void;
}

/* ─── Datos locales ─────────────────────────────────────────────────── */

const CATEGORIES = [
  { id: "Todos",             label: "Todas las Categorías" },
  { id: "Emergencias",       label: "Emergencias 24/7"     },
  { id: "Tableros & Potencia", label: "Tableros & Fuerza"  },
  { id: "Certificación SEC", label: "Certificación TE1"    },
  { id: "Generadores",       label: "Grupos Electrógenos"  },
  { id: "Repuestos",         label: "Repuestos en Stock"   },
];

/** Ítems de la barra de navegación secundaria (estilo Mercado Libre) */
const NAV_LINKS = [
  { id: "categorias", label: "Categorías"   },
  { id: "ofertas",    label: "Ofertas"      },
  { id: "cupones",    label: "Cupones"      },
  { id: "ayuda",      label: "Ayuda"        },
];

/* ─── Componente ────────────────────────────────────────────────────── */

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  search,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenCart,
  onOpenLogin,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { cartCount, subtotal } = useCart();
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  const handleCategory = (id: string) => {
    onSelectCategory(id);
    onTabChange("catalog");
    setCatMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 shadow-sm">

      {/* ── 1. TOP BAR (oscura, discreta) ─────────────────────────── */}
      <div className="bg-slate-950 text-slate-400 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between gap-4">

          {/* izquierda */}
          <div className="flex items-center gap-5">
            <a
              href="tel:+56987654321"
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition"
            >
              <Icon name="phone" size={12} className="text-blue-400" />
              Fono 24/7: +56 9 8765 4321
            </a>
            <button
              onClick={() => onTabChange("my-orders")}
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Icon name="truck" size={12} />
              Rastrear mi Orden
            </button>
          </div>

          {/* derecha */}
          <span className="hidden sm:flex items-center gap-1.5 text-emerald-500">
            <Icon name="shield-check" size={12} />
            Garantía SEC Oficial 6 Meses
          </span>

        </div>
      </div>

      {/* ── 2. MAIN BAR (blanca, logo + buscador + acciones) ─────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4 lg:gap-6">

          {/* Logo */}
          <div className="shrink-0">
            <Brand onClick={() => onTabChange("catalog")} />
          </div>

          {/* Buscador — desktop */}
          <div className="hidden md:flex flex-1 min-w-0">
            <div className="w-full flex items-center rounded-lg overflow-hidden border border-slate-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
              {/* selector de categoría */}
              <div className="border-r border-slate-200 px-3 h-11 flex items-center bg-slate-50 shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategory(e.target.value)}
                  aria-label="Categoría"
                  className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer max-w-[140px]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              {/* campo de texto */}
              <input
                type="search"
                placeholder="¿Qué servicio o repuesto eléctrico necesitas?"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => onTabChange("catalog")}
                className="flex-1 min-w-0 h-11 px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
              {/* botón buscar */}
              <button
                type="button"
                onClick={() => onTabChange("catalog")}
                aria-label="Buscar"
                className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center"
              >
                <Icon name="search" size={18} />
              </button>
            </div>
          </div>

          {/* ── Acciones de usuario (estilo ML) ── */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto shrink-0">

            {/* Sin sesión → Crea tu cuenta + Ingresa */}
            {!isAuthenticated && (
              <>
                <button
                  onClick={onOpenLogin}
                  className="hidden lg:block text-sm text-slate-700 hover:text-blue-600 hover:underline transition whitespace-nowrap"
                >
                  Crea tu cuenta
                </button>
                <button
                  onClick={onOpenLogin}
                  className="text-sm font-semibold text-slate-800 hover:text-blue-600 hover:underline transition whitespace-nowrap"
                >
                  Ingresa
                </button>
              </>
            )}

            {/* Con sesión → avatar + nombre */}
            {isAuthenticated && user && (
              <button
                onClick={() => onTabChange("profile")}
                className={`flex items-center gap-2 text-sm font-semibold transition ${
                  currentTab === "profile" ? "text-blue-600" : "text-slate-800 hover:text-blue-600"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                  {user.fullName.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden lg:block max-w-[100px] truncate">{user.fullName}</span>
              </button>
            )}

            {/* Mis Órdenes */}
            <button
              onClick={() => onTabChange("my-orders")}
              className={`flex items-center gap-1.5 text-sm font-semibold transition whitespace-nowrap ${
                currentTab === "my-orders" ? "text-blue-600" : "text-slate-800 hover:text-blue-600"
              }`}
            >
              <Icon name="package" size={20} />
              <span className="hidden sm:block">Mis compras</span>
            </button>

            {/* Carrito */}
            <button
              onClick={onOpenCart}
              aria-label="Ver carrito"
              className="relative flex items-center gap-1.5 text-slate-800 hover:text-blue-600 transition"
            >
              <Icon name="shopping-cart" size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
              {/* monto debajo del icono, solo lg */}
              {subtotal > 0 && (
                <span className="hidden lg:block text-xs font-bold text-slate-900 whitespace-nowrap">
                  ${subtotal.toLocaleString("es-CL")}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Buscador móvil */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center rounded-lg overflow-hidden border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <input
              type="search"
              placeholder="Buscar servicios o repuestos..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => onTabChange("catalog")}
              className="flex-1 min-w-0 px-3 py-2.5 text-xs outline-none"
            />
            <button
              type="button"
              onClick={() => onTabChange("catalog")}
              aria-label="Buscar"
              className="px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <Icon name="search" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. NAV BAR (Categorías · Ofertas · Cupones · Ayuda) ─── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">

          {/* Botón "Todas las Categorías" (desplegable) */}
          <div className="relative shrink-0">
            <button
              onClick={() => setCatMenuOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                catMenuOpen
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              <Icon name="menu" size={15} />
              Todas las Categorías
              <Icon name="chevron-down" size={13} />
            </button>

            {/* Desplegable de categorías */}
            {catMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCategory(c.id)}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      selectedCategory === c.id
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="w-px h-4 bg-slate-200 mx-1 shrink-0" />

          {/* Links de navegación: Ofertas, Cupones, Ayuda */}
          {NAV_LINKS.filter((l) => l.id !== "categorias").map((link) => (
            <button
              key={link.id}
              className="px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md whitespace-nowrap transition"
            >
              {link.label}
            </button>
          ))}

          {/* Beneficios — solo xl */}
          <div className="hidden xl:flex items-center gap-4 ml-auto text-[11px] font-semibold shrink-0 text-slate-500">
            <span className="flex items-center gap-1 text-blue-700">
              <Icon name="truck" size={13} />
              Despacho en Terreno
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <Icon name="shield-check" size={13} />
              SEC RIC N°02
            </span>
          </div>

        </div>
      </div>

    </header>
  );
};

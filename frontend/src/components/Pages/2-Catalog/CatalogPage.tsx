import React, { useMemo, useState } from "react";
import { useCart } from "../../../contexts/CartContext";
import { ElectricalProduct, ServiceCategory } from "../../../types/product";
import { formatPrice } from "../../../utils/currency";
import { Icon } from "../../ui/Icon";
import { ELECTRICAL_CATALOG } from "@/mocks/catalogo";


interface CatalogPageProps {
  searchQuery: string;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenOrderTracking: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  searchQuery,
  selectedCategory,
  onSelectCategory,
  onOpenOrderTracking,
}) => {
  const { addToCart } = useCart();
  const [priceRange, setPriceRange] = useState<number>(250000);
  const [onlyStock, setOnlyStock] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    return ELECTRICAL_CATALOG.filter((item) => {
      const matchCategory =
        selectedCategory === "Todos" || item.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = item.price <= priceRange;
      const matchStock = !onlyStock || (item.stock && item.stock > 0);

      return matchCategory && matchSearch && matchPrice && matchStock;
    });
  }, [selectedCategory, searchQuery, priceRange, onlyStock]);

  const topCategories = [
    { name: "Emergencias", label: "Emergencias 24/7", subtitle: "Respuesta en < 2 hrs" },
    { name: "Tableros & Potencia", label: "Tableros eléctricos", subtitle: "Mantención preventiva" },
    { name: "Certificación SEC", label: "Certificación TE1", subtitle: "Firma Instalador SEC" },
    { name: "Generadores", label: "Grupos electrógenos", subtitle: "Pruebas de transferencia" },
    { name: "Repuestos", label: "Repuestos certificados", subtitle: "Stock disponible" },
  ];

  const brands = [
    "Legrand",
    "Schneider Electric",
    "Philips Lighting",
    "ABB",
    "Bticino",
    "Eaton",
  ];

  const discountOf = (price: number, original?: number) =>
    original && original > price
      ? Math.round((1 - price / original) * 100)
      : 0;

  return (
    <div className="bg-sky-50/60 min-h-screen">
      {/* 1. BANNER PRINCIPAL (estilo carrusel Mercado Libre) */}
      <section className="bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 pt-8 sm:pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 max-w-xl">
              <span className="text-xs font-semibold text-blue-700">
                Exclusivo para empresas e inmuebles
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Mantención eléctrica y servicio en terreno
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Cuadrillas coordinadas, repuestos homologados y seguimiento de
                órdenes con firma técnica digital.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => onSelectCategory("Emergencias")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-md transition"
                >
                  Solicitar cuadrilla
                </button>
                <button
                  onClick={onOpenOrderTracking}
                  className="bg-white hover:bg-sky-50 text-blue-700 text-sm font-semibold px-5 py-3 rounded-md transition flex items-center gap-2 shadow-sm"
                >
                  <Icon name="truck" size={15} />
                  <span>Ver mis órdenes</span>
                </button>
              </div>
            </div>

            {/* ESPACIO PARA IMAGEN DEL BANNER */}
            <div className="hidden md:flex justify-center">
              <div className="w-full max-w-md aspect-[4/3] rounded-2xl bg-white/50 border border-dashed border-sky-300 flex items-center justify-center text-xs text-sky-500">
                {/* IMAGEN BANNER: reemplazar este div por <img src="..." className="w-full h-full object-contain" /> */}
                Imagen del banner
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TARJETAS DE ACCESO RÁPIDO (montadas sobre el banner, como en Mercado Libre) */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {topCategories.map((c) => (
            <button
              key={c.name}
              onClick={() => onSelectCategory(c.name)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 text-left flex flex-col gap-3"
            >
              <div>
                <h3 className="font-semibold text-sm text-slate-800 truncate">
                  {c.label}
                </h3>
                <span className="text-xs text-slate-400 block truncate">
                  {c.subtitle}
                </span>
              </div>
              {/* ESPACIO PARA IMAGEN DE LA CATEGORÍA */}
              <div className="w-full aspect-[16/10] rounded-md bg-sky-50 border border-dashed border-sky-200" />
            </button>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* 3. MARCAS */}
        <section className="bg-white rounded-lg shadow-sm px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Marcas homologadas
          </h2>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <span
                key={b}
                className="text-xs text-blue-700 bg-sky-50 hover:bg-sky-100 transition px-3 py-1.5 rounded-full"
              >
                {b}
              </span>
            ))}
          </div>
        </section>

        {/* 4. FILTROS + LISTADO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* FILTROS LATERALES (sin cajas pesadas, como Mercado Libre) */}
          <aside className="lg:col-span-3 bg-white rounded-lg shadow-sm p-5 space-y-5 text-sm">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-800">Categorías</h3>
              <div className="flex flex-col">
                {(["Todos", "Emergencias", "Tableros & Potencia", "Certificación SEC", "Generadores", "Repuestos"] as ServiceCategory[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => onSelectCategory(cat)}
                      className={`text-left py-1.5 text-[13px] transition ${
                        selectedCategory === cat
                          ? "text-blue-700 font-semibold"
                          : "text-slate-600 hover:text-blue-600"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-sky-100">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Precio hasta</h3>
                <span className="text-blue-700 font-semibold text-[13px]">
                  {formatPrice(priceRange)}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="5000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-sky-100">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer text-[13px]">
                <input
                  type="checkbox"
                  checked={onlyStock}
                  onChange={(e) => setOnlyStock(e.target.checked)}
                  className="rounded border-sky-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Solo repuestos en stock</span>
              </label>
            </div>

            <div className="pt-4 border-t border-sky-100 text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-700">Cotizaciones formales</p>
              <p className="mt-0.5">
                Para condominios y plantas industriales emitimos presupuestos
                con validez de 15 días.
              </p>
            </div>
          </aside>

          {/* LISTADO */}
          <main className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-slate-800">
                {selectedCategory === "Todos"
                  ? "Servicios y repuestos eléctricos"
                  : selectedCategory}
                <span className="text-sm text-slate-400 font-normal ml-2">
                  {filteredProducts.length} resultados
                </span>
              </h2>
              <span className="text-xs text-slate-500">Valores netos en CLP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                const discount = discountOf(p.price, p.originalPrice);
                return (
                  <article
                    key={p.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                  >
                    {/* ESPACIO PARA IMAGEN DEL SERVICIO / PRODUCTO */}
                    <div className="w-full aspect-[4/3] bg-sky-50 border-b border-sky-100 flex items-center justify-center text-xs text-sky-400">
                      {/* IMAGEN: reemplazar por <img src={...} alt={p.name} className="w-full h-full object-cover" /> */}
                      Imagen
                    </div>

                    <div className="p-4 flex flex-col flex-1 gap-1.5">
                      {p.highlightBadge && (
                        <span className="self-start text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {p.highlightBadge}
                        </span>
                      )}

                      <h3 className="text-sm text-slate-800 leading-snug line-clamp-2">
                        {p.name}
                      </h3>

                      <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                        {p.description}
                      </p>

                      <div className="mt-1">
                        {p.originalPrice && (
                          <span className="text-xs text-slate-400 line-through block">
                            {formatPrice(p.originalPrice)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-2">
                          <strong className="text-2xl font-normal text-slate-900">
                            {formatPrice(p.price)}
                          </strong>
                          {discount > 0 && (
                            <span className="text-xs font-semibold text-emerald-600">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs space-y-0.5">
                        {p.freeDispatch && (
                          <p className="text-emerald-600 font-semibold">
                            Envío gratis
                          </p>
                        )}
                        <p className="text-slate-500">{p.responseTime}</p>
                        <p className="text-slate-500">
                          Garantía: {p.warrantyMonths} meses
                        </p>
                      </div>

                      <div className="mt-auto pt-3">
                        <button
                          onClick={() => addToCart(p)}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm py-2.5 rounded-md transition"
                        >
                          Solicitar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-lg p-10 text-center shadow-sm text-sm text-slate-500">
                No se encontraron servicios para el filtro seleccionado.
              </div>
            )}
          </main>
        </section>

        {/* 5. BENEFICIOS (texto simple, sin íconos) */}
        <section className="bg-white rounded-lg shadow-sm px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
          <span>Instaladores SEC Clase A y B</span>
          <span>Atención de urgencia &lt; 2 hrs</span>
          <span>Garantía de 6 meses oficial</span>
          <span>Portal cliente aislado (Sin Entra ID)</span>
        </section>
      </div>
    </div>
  );
};
import React, { useMemo, useState } from "react";
import { useCommercial } from "@/contexts/CommercialContext";
import { OperationalProductCatalogItem } from "@/types/commercial";
import { formatPrice } from "@/utils/currency";
import { resolveDriveImageUrl } from "@/utils/googleDrive";

/* ----------------------------------------------------------------------------
   Tipos locales del formulario. Si ya existen equivalentes en
   "@/types/commercial" (Campaign, CampaignType...), reemplázalos aquí y
   ajusta solo `onSave`.
   ---------------------------------------------------------------------------- */
type ItemId = OperationalProductCatalogItem["id"];

export type CampaignType = "PERCENT" | "FIXED_PRICE" | "VOLUME";
export type CampaignStatus = "BORRADOR" | "EN_APROBACION" | "APROBADA" | "ACTIVA";

export interface CampaignLine {
  itemId: ItemId;
  /** PERCENT y VOLUME: % de descuento. FIXED_PRICE: precio final en CLP. */
  value: number;
}

export interface CampaignDraft {
  id?: string;
  name: string;
  type: CampaignType;
  startDate: string; // yyyy-mm-dd
  endDate: string;
  audience: string;
  minQty: number; // solo VOLUME
  description: string;
  internalNote: string;
  lines: CampaignLine[];
  status: CampaignStatus;
}

interface CampaignFormProps {
  initial?: Partial<CampaignDraft> | null;
  embedded?: boolean;
  onSave: (draft: CampaignDraft, action: "draft" | "submit") => void;
  onCancel: () => void;
}

const TYPES: { id: CampaignType; title: string; hint: string }[] = [
  { id: "PERCENT", title: "Descuento porcentual", hint: "Un % de rebaja sobre el precio de lista de cada producto." },
  { id: "FIXED_PRICE", title: "Precio especial", hint: "Tú defines el precio final de cada producto." },
  { id: "VOLUME", title: "Descuento por volumen", hint: "La rebaja aplica al comprar una cantidad mínima." },
];

const STATUS_STEPS: { id: CampaignStatus; label: string }[] = [
  { id: "BORRADOR", label: "Borrador" },
  { id: "EN_APROBACION", label: "En aprobación" },
  { id: "APROBADA", label: "Aprobada" },
  { id: "ACTIVA", label: "Activa" },
];

const AUDIENCIAS = [
  "Todos los clientes",
  "Clientes con cuenta corriente",
  "Clientes nuevos",
  "Cartera de un ejecutivo",
];

const MAX_DESC = 240;
const HIGH_DISCOUNT = 50;

type TabId = "productos" | "condiciones" | "notas";

const hoy = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const hasImage = (i: OperationalProductCatalogItem) => i.hasMandatoryImage || Boolean(i.imageUrl);

const pctOff = (list: number, price: number) =>
  list > 0 ? Math.max(0, Math.round((1 - price / list) * 100)) : 0;

export const CampaignForm: React.FC<CampaignFormProps> = ({
  initial = null,
  embedded = false,
  onSave,
  onCancel,
}) => {
  const { operationalItems } = useCommercial();

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<CampaignType>(initial?.type ?? "PERCENT");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [audience, setAudience] = useState(initial?.audience ?? AUDIENCIAS[0]);
  const [minQty, setMinQty] = useState<number>(initial?.minQty ?? 2);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [internalNote, setInternalNote] = useState(initial?.internalNote ?? "");
  const [lines, setLines] = useState<CampaignLine[]>(initial?.lines ?? []);
  const status: CampaignStatus = initial?.status ?? "BORRADOR";

  const [tab, setTab] = useState<TabId>("productos");
  const [query, setQuery] = useState("");
  const [bulk, setBulk] = useState<string>("");
  const [showErrors, setShowErrors] = useState(false);

  const isNew = !initial?.id;
  const editable = status === "BORRADOR";

  const byId = useMemo(() => new Map(operationalItems.map((i) => [i.id, i])), [operationalItems]);

  /* ------------------------------ Líneas ------------------------------ */
  const promoPrice = (item: OperationalProductCatalogItem, line: CampaignLine) =>
    type === "FIXED_PRICE" ? line.value : Math.round(item.salePrice * (1 - line.value / 100));

  const lineError = (item: OperationalProductCatalogItem, line: CampaignLine): string | null => {
    if (type === "FIXED_PRICE") {
      if (!line.value || line.value <= 0) return "Ingresa un precio";
      if (line.value >= item.salePrice) return "Debe ser menor al precio de lista";
      return null;
    }
    if (!line.value || line.value < 1) return "Ingresa un descuento";
    if (line.value > 90) return "Máximo 90%";
    return null;
  };

  const addItem = (item: OperationalProductCatalogItem) => {
    if (!hasImage(item) || lines.some((l) => l.itemId === item.id)) return;
    const value = type === "FIXED_PRICE" ? Math.round(item.salePrice * 0.9) : 10;
    setLines((prev) => [...prev, { itemId: item.id, value }]);
    setQuery("");
  };

  const removeItem = (id: ItemId) => setLines((prev) => prev.filter((l) => l.itemId !== id));

  const setValue = (id: ItemId, raw: string) => {
    const value = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(value)) return;
    setLines((prev) => prev.map((l) => (l.itemId === id ? { ...l, value } : l)));
  };

  const applyBulk = () => {
    const value = Number(bulk);
    if (!value || value <= 0) return;
    setLines((prev) =>
      prev.map((l) => {
        const item = byId.get(l.itemId);
        if (!item) return l;
        return { ...l, value: type === "FIXED_PRICE" ? Math.round(item.salePrice * (1 - value / 100)) : value };
      })
    );
  };

  // Al cambiar de tipo se convierten los valores para no perder lo ya cargado.
  const changeType = (next: CampaignType) => {
    if (next === type) return;
    setLines((prev) =>
      prev.map((l) => {
        const item = byId.get(l.itemId);
        if (!item) return l;
        if (next === "FIXED_PRICE") return { ...l, value: Math.round(item.salePrice * (1 - l.value / 100)) };
        if (type === "FIXED_PRICE") return { ...l, value: pctOff(item.salePrice, l.value) };
        return l;
      })
    );
    setType(next);
  };

  /* ---------------------------- Buscador ------------------------------ */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const taken = new Set(lines.map((l) => l.itemId));
    return operationalItems
      .filter((i) => !taken.has(i.id))
      .filter(
        (i) =>
          !q ||
          i.code.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [operationalItems, lines, query]);

  /* --------------------------- Validaciones --------------------------- */
  const nameOk = name.trim().length >= 4;
  const datesError = !startDate || !endDate
    ? "Define la fecha de inicio y de término."
    : endDate < startDate
      ? "El término no puede ser anterior al inicio."
      : isNew && startDate < hoy()
        ? "El inicio no puede estar en el pasado."
        : null;
  const linesOk = lines.length > 0 && lines.every((l) => {
    const item = byId.get(l.itemId);
    return item ? !lineError(item, l) : false;
  });
  const minQtyOk = type !== "VOLUME" || minQty >= 2;

  const checks = [
    { label: "Nombre de la campaña", ok: nameOk },
    { label: "Vigencia con fechas válidas", ok: !datesError },
    { label: "Al menos un producto", ok: lines.length > 0 },
    { label: "Descuentos o precios válidos", ok: lines.length > 0 && linesOk },
    ...(type === "VOLUME" ? [{ label: "Cantidad mínima de 2 o más", ok: minQtyOk }] : []),
  ];
  const canSubmit = checks.every((c) => c.ok);

  /* ----------------------------- Resumen ------------------------------ */
  const summary = useMemo(() => {
    const rows = lines
      .map((l) => ({ line: l, item: byId.get(l.itemId) }))
      .filter((r): r is { line: CampaignLine; item: OperationalProductCatalogItem } => Boolean(r.item));
    const avg = rows.length
      ? Math.round(
          rows.reduce((acc, r) => {
            const price = r.item.salePrice > 0 && type === "FIXED_PRICE"
              ? r.line.value
              : Math.round(r.item.salePrice * (1 - r.line.value / 100));
            return acc + pctOff(r.item.salePrice, price);
          }, 0) / rows.length
        )
      : 0;
    const stock = rows.reduce((acc, r) => acc + (r.item.stock ?? 0), 0);
    const days =
      startDate && endDate && endDate >= startDate
        ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1
        : 0;
    return { rows, avg, stock, days };
  }, [lines, byId, type, startDate, endDate]);

  const featured = summary.rows[0];
  const featuredPrice = featured ? promoPrice(featured.item, featured.line) : 0;

  /* ------------------------------ Acciones ---------------------------- */
  const buildDraft = (): CampaignDraft => ({
    id: initial?.id,
    name: name.trim(),
    type,
    startDate,
    endDate,
    audience,
    minQty,
    description: description.trim(),
    internalNote: internalNote.trim(),
    lines,
    status,
  });

  const saveDraft = () => {
    if (!nameOk) {
      setShowErrors(true);
      return;
    }
    onSave(buildDraft(), "draft");
  };

  const submit = () => {
    setShowErrors(true);
    if (!canSubmit) return;
    onSave({ ...buildDraft(), status: "EN_APROBACION" }, "submit");
  };

  /* -------------------------------- UI -------------------------------- */
  const valueHeader = type === "FIXED_PRICE" ? "Precio promo (CLP)" : "Descuento (%)";
  const statusIndex = STATUS_STEPS.findIndex((s) => s.id === status);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "productos", label: "Productos", count: lines.length },
    { id: "condiciones", label: "Condiciones y alcance" },
    { id: "notas", label: "Notas para jefatura" },
  ];

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      noValidate
      className={embedded ? "w-full animate-fadeIn" : "w-full animate-fadeIn"}
    >
      {/* Barra de control (patrón Odoo): ruta, acciones y barra de estado */}
      <div className="sticky top-0 z-20 bg-fondo/95 backdrop-blur border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <nav aria-label="Ruta" className="text-xs text-slate-500">
              <button type="button" onClick={onCancel} className="hover:text-brand-700 font-medium cursor-pointer">
                Campañas comerciales
              </button>
              <span className="mx-1.5">/</span>
              <span className="text-slate-700 font-semibold">{isNew ? "Nueva campaña" : name || "Campaña"}</span>
            </nav>
            <ol className="mt-2 flex items-center gap-1" aria-label="Estado de la campaña">
              {STATUS_STEPS.map((s, i) => (
                <li
                  key={s.id}
                  aria-current={i === statusIndex ? "step" : undefined}
                  className={`h-6 px-2.5 inline-flex items-center rounded-md text-[11px] font-semibold ${
                    i === statusIndex
                      ? "bg-brand-600 text-white"
                      : i < statusIndex
                        ? "bg-brand-100 text-brand-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {s.label}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onCancel} className="btn-ghost">
              Descartar
            </button>
            {editable && (
              <>
                <button type="button" onClick={saveDraft} className="btn-secondary">
                  Guardar borrador
                </button>
                <button
                  type="button"
                  onClick={submit}
                  aria-disabled={!canSubmit}
                  className={`btn-primary ${!canSubmit ? "opacity-60" : ""}`}
                >
                  Enviar a aprobación
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* ------------------------- Hoja principal ------------------------- */}
        <div className="panel overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Título grande, estilo Odoo */}
            <div>
              <label htmlFor="camp-name" className="label">
                Nombre de la campaña
              </label>
              <input
                id="camp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editable}
                maxLength={80}
                placeholder="Ej.: Cyber de invierno — herramientas"
                aria-invalid={showErrors && !nameOk}
                aria-describedby={showErrors && !nameOk ? "camp-name-err" : undefined}
                className="w-full h-12 px-0 bg-transparent border-0 border-b border-slate-300 text-xl font-bold text-slate-900 placeholder:font-medium outline-none transition-colors hover:border-slate-400 focus:border-brand-600 aria-invalid:border-red-500 disabled:text-slate-600"
              />
              {showErrors && !nameOk && (
                <p id="camp-name-err" className="mt-1.5 text-xs font-medium text-red-700">
                  Escribe un nombre de al menos 4 caracteres.
                </p>
              )}
            </div>

            {/* Tipo de promoción (patrón Mercado Libre) */}
            <fieldset disabled={!editable}>
              <legend className="label">Tipo de promoción</legend>
              <div role="radiogroup" className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {TYPES.map((t) => {
                  const active = type === t.id;
                  return (
                    <label
                      key={t.id}
                      className={`relative flex flex-col gap-1 p-4 rounded-xl border cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 ${
                        active
                          ? "border-brand-600 bg-brand-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="campaign-type"
                        value={t.id}
                        checked={active}
                        onChange={() => changeType(t.id)}
                        className="sr-only"
                      />
                      <span className={`text-[13px] font-bold ${active ? "text-brand-700" : "text-slate-900"}`}>
                        {t.title}
                      </span>
                      <span className="text-xs text-slate-600 leading-snug">{t.hint}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Vigencia y público */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="camp-start">Inicio</label>
                <input
                  id="camp-start"
                  type="date"
                  value={startDate}
                  min={isNew ? hoy() : undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!editable}
                  aria-invalid={showErrors && Boolean(datesError)}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="camp-end">Término</label>
                <input
                  id="camp-end"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!editable}
                  aria-invalid={showErrors && Boolean(datesError)}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="camp-audience">Dirigida a</label>
                <select
                  id="camp-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  disabled={!editable}
                  className="input"
                >
                  {AUDIENCIAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              {showErrors && datesError && (
                <p role="alert" className="md:col-span-3 -mt-2 text-xs font-medium text-red-700">
                  {datesError}
                </p>
              )}
            </div>
          </div>

          {/* Pestañas (notebook de Odoo) */}
          <div className="border-t border-slate-200">
            <div role="tablist" aria-label="Secciones de la campaña" className="px-6 pt-3 flex gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
              {tabs.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`tab-${t.id}`}
                    aria-selected={active}
                    aria-controls={`panel-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={`shrink-0 -mb-px px-3.5 py-2.5 text-[13px] border-b-2 transition-colors cursor-pointer ${
                      active
                        ? "border-brand-600 text-brand-700 font-bold"
                        : "border-transparent text-slate-600 font-medium hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                    {t.count !== undefined && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[11px] tabular-nums ${active ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* --- Productos --- */}
            {tab === "productos" && (
              <div id="panel-productos" role="tabpanel" aria-labelledby="tab-productos" className="p-6 space-y-5">
                {editable && (
                  <div className="space-y-3">
                    <div className="search-group max-w-md !bg-white">
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar producto por código, nombre o categoría..."
                        aria-label="Buscar productos para agregar"
                      />
                    </div>

                    {results.length > 0 ? (
                      <ul className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-white">
                        {results.map((item) => {
                          const ok = hasImage(item);
                          return (
                            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                                <p className="text-xs text-slate-500 truncate">
                                  <span className="font-mono tabular-nums">{item.code}</span> · {item.category} · {formatPrice(item.salePrice)} · Stock {item.stock}
                                </p>
                              </div>
                              {ok ? (
                                <button type="button" onClick={() => addItem(item)} className="btn-secondary !min-h-[32px] !px-3 !text-xs shrink-0">
                                  Agregar
                                </button>
                              ) : (
                                <span className="badge bg-red-50 text-red-700 border border-red-200 shrink-0">
                                  Sin imagen
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">No hay más productos que coincidan con la búsqueda.</p>
                    )}
                    <p className="text-xs text-slate-500">
                      Solo se pueden incluir productos con imagen publicada en el catálogo operativo.
                    </p>
                  </div>
                )}

                {/* Aplicar a todos */}
                {editable && lines.length > 1 && (
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label htmlFor="camp-bulk" className="text-xs font-semibold text-slate-700">
                      Aplicar el mismo descuento (%) a todos
                    </label>
                    <input
                      id="camp-bulk"
                      type="number"
                      min={1}
                      max={90}
                      inputMode="numeric"
                      value={bulk}
                      onChange={(e) => setBulk(e.target.value)}
                      className="input !h-8 !w-20 !text-xs text-right tabular-nums"
                    />
                    <button type="button" onClick={applyBulk} className="btn-secondary !min-h-[32px] !px-3 !text-xs">
                      Aplicar
                    </button>
                  </div>
                )}

                {/* Tabla de líneas */}
                <div className="rounded-xl border border-slate-200 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                        <th className="py-2.5 px-4">Producto</th>
                        <th className="py-2.5 px-3 text-right">Precio lista</th>
                        <th className="py-2.5 px-3 text-right">{valueHeader}</th>
                        <th className="py-2.5 px-3 text-right">Precio final</th>
                        <th className="py-2.5 px-3 text-right">Rebaja</th>
                        <th className="py-2.5 px-3 text-right">Stock</th>
                        {editable && <th className="py-2.5 px-4"><span className="sr-only">Quitar</span></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[13px]">
                      {summary.rows.map(({ line, item }) => {
                        const err = lineError(item, line);
                        const final = promoPrice(item, line);
                        const off = pctOff(item.salePrice, final);
                        return (
                          <tr key={item.id} className="align-top">
                            <td className="py-3 px-4 max-w-[16rem]">
                              <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                              <p className="text-xs text-slate-500 font-mono tabular-nums">{item.code}</p>
                              {item.restrictedCommunes && item.restrictedCommunes.length > 0 && (
                                <p className="text-[11px] text-amber-700 mt-0.5 truncate">
                                  Restricción: {item.restrictedCommunes.join(", ")}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right tabular-nums text-slate-600 whitespace-nowrap">
                              {formatPrice(item.salePrice)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <input
                                type="number"
                                min={0}
                                inputMode="numeric"
                                value={line.value || ""}
                                onChange={(e) => setValue(item.id, e.target.value)}
                                disabled={!editable}
                                aria-label={`${valueHeader} de ${item.name}`}
                                aria-invalid={Boolean(err)}
                                className="input !h-8 !w-28 !text-xs text-right tabular-nums aria-invalid:border-red-500"
                              />
                              {err && <p className="mt-1 text-[11px] font-medium text-red-700">{err}</p>}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                              {err ? "—" : formatPrice(final)}
                            </td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              {!err && (
                                <span
                                  className={`badge ${
                                    off >= HIGH_DISCOUNT
                                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                  title={off >= HIGH_DISCOUNT ? "Descuento alto: jefatura lo revisará" : undefined}
                                >
                                  −{off}%
                                </span>
                              )}
                            </td>
                            <td className={`py-3 px-3 text-right tabular-nums whitespace-nowrap ${item.stock <= 0 ? "text-red-700 font-semibold" : "text-slate-700"}`}>
                              {item.stock}
                            </td>
                            {editable && (
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="btn-ghost !min-h-[30px] !px-2 !text-xs"
                                  aria-label={`Quitar ${item.name}`}
                                >
                                  Quitar
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      {lines.length === 0 && (
                        <tr>
                          <td colSpan={editable ? 7 : 6} className="py-10 text-center text-xs text-slate-500">
                            Aún no hay productos. Busca arriba y agrega los que participarán.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- Condiciones --- */}
            {tab === "condiciones" && (
              <div id="panel-condiciones" role="tabpanel" aria-labelledby="tab-condiciones" className="p-6 space-y-5 max-w-2xl">
                {type === "VOLUME" && (
                  <div className="max-w-[12rem]">
                    <label className="label" htmlFor="camp-minqty">Cantidad mínima por compra</label>
                    <input
                      id="camp-minqty"
                      type="number"
                      min={2}
                      inputMode="numeric"
                      value={minQty || ""}
                      onChange={(e) => setMinQty(Number(e.target.value))}
                      disabled={!editable}
                      aria-invalid={showErrors && !minQtyOk}
                      className="input tabular-nums"
                    />
                  </div>
                )}
                <div>
                  <label className="label" htmlFor="camp-desc">Descripción para el cliente</label>
                  <textarea
                    id="camp-desc"
                    rows={4}
                    maxLength={MAX_DESC}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!editable}
                    placeholder="Qué incluye la promoción y qué debe saber el cliente..."
                    className="w-full p-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 outline-none transition-[border-color,box-shadow] hover:border-slate-400 focus:border-brand-600 focus:ring-3 focus:ring-brand-200/70 disabled:bg-slate-100"
                  />
                  <p className="mt-1 text-right text-[11px] text-slate-500 tabular-nums">
                    {description.length}/{MAX_DESC}
                  </p>
                </div>
              </div>
            )}

            {/* --- Notas --- */}
            {tab === "notas" && (
              <div id="panel-notas" role="tabpanel" aria-labelledby="tab-notas" className="p-6 max-w-2xl">
                <label className="label" htmlFor="camp-note">Contexto para quien aprueba</label>
                <textarea
                  id="camp-note"
                  rows={5}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  disabled={!editable}
                  placeholder="Motivo de la campaña, margen esperado, acuerdos con proveedores..."
                  className="w-full p-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 outline-none transition-[border-color,box-shadow] hover:border-slate-400 focus:border-brand-600 focus:ring-3 focus:ring-brand-200/70 disabled:bg-slate-100"
                />
                <p className="mt-1 text-xs text-slate-500">Esta nota no se muestra a los clientes.</p>
              </div>
            )}
          </div>
        </div>

        {/* ----------------------- Resumen lateral (ML) ---------------------- */}
        <aside className="space-y-4 xl:sticky xl:top-28" aria-label="Resumen de la campaña">
          <div className="panel p-4 space-y-3">
            <h2 className="text-[13px] font-bold text-slate-900">Así la verá el cliente</h2>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="relative aspect-[4/3] bg-slate-100 flex items-center justify-center">
                {featured && resolveDriveImageUrl(featured.item.imageUrl || "") ? (
                  <img
                    src={resolveDriveImageUrl(featured.item.imageUrl || "")}
                    alt={featured.item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-500">Agrega un producto</span>
                )}
                {featured && !lineError(featured.item, featured.line) && (
                  <span className="absolute top-2 left-2 badge bg-brand-600 text-white">
                    −{pctOff(featured.item.salePrice, featuredPrice)}%
                  </span>
                )}
              </div>
              <div className="p-3 space-y-0.5">
                <p className="text-xs font-bold text-slate-900 truncate">{name.trim() || "Nombre de la campaña"}</p>
                {featured && !lineError(featured.item, featured.line) && (
                  <>
                    <p className="text-[11px] text-slate-500 line-through tabular-nums">
                      {formatPrice(featured.item.salePrice)}
                    </p>
                    <p className="text-sm font-bold text-brand-700 tabular-nums">{formatPrice(featuredPrice)}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div>
                <dd className="text-lg font-bold text-slate-900 tabular-nums">{lines.length}</dd>
                <dt className="text-[11px] text-slate-500">Productos</dt>
              </div>
              <div>
                <dd className="text-lg font-bold text-slate-900 tabular-nums">{summary.avg}%</dd>
                <dt className="text-[11px] text-slate-500">Rebaja media</dt>
              </div>
              <div>
                <dd className="text-lg font-bold text-slate-900 tabular-nums">{summary.days}</dd>
                <dt className="text-[11px] text-slate-500">Días</dt>
              </div>
            </dl>
            <p className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              Stock comprometido: <strong className="text-slate-900 tabular-nums">{summary.stock}</strong> un.
            </p>
          </div>

          <div className="panel p-4">
            <h2 className="text-[13px] font-bold text-slate-900 mb-2">Antes de enviar</h2>
            <ul className="space-y-1.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  <span
                    aria-hidden="true"
                    className={`w-4 h-4 rounded-full shrink-0 border flex items-center justify-center text-[10px] font-bold ${
                      c.ok ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-300 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={c.ok ? "text-slate-800" : "text-slate-600"}>
                    {c.label}
                    <span className="sr-only">{c.ok ? ": listo" : ": pendiente"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </form>
  );
};
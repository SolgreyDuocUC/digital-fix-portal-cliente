import React, { ReactNode, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { changePassword } from "../../../services/authService";
import { errorMessage } from "../../../services/api";
import { CommuneSelect, CommuneValue } from "../../ui/CommuneSelect";

interface ProfilePageProps {
  /** Opcional: si se entrega, se muestra el acceso directo a "Mis órdenes". */
  onOpenOrderTracking?: () => void;
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const Section: React.FC<{ title: string; action?: ReactNode; children: ReactNode }> = ({ title, action, children }) => (
  <section className="panel">
    <header className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {action}
    </header>
    {children}
  </section>
);

const Row: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
    <dt className="text-xs text-slate-500 sm:pt-0.5">{label}</dt>
    <dd className="sm:col-span-2 text-sm text-slate-900 break-words">{value || "Sin registrar"}</dd>
  </div>
);

const Aviso: React.FC<{ tipo: "ok" | "error"; children: ReactNode }> = ({ tipo, children }) => (
  <div
    role={tipo === "error" ? "alert" : "status"}
    className={`rounded-lg border px-3 py-2.5 text-xs ${
      tipo === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"
    }`}
  >
    {children}
  </div>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenOrderTracking }) => {
  const { user, updateProfile, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", businessName: "", phone: "", address: "" });
  const [location, setLocation] = useState<CommuneValue>({});
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ actual: "", nueva: "", repetir: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  if (!user) return null;

  const empezarEdicion = () => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName ?? "",
      businessName: user.businessName ?? "",
      phone: user.phone,
      address: user.address,
    });
    setLocation({ communeId: user.communeId, commune: user.commune, region: user.region });
    setProfileMsg(null);
    setEditing(true);
  };

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) return setProfileMsg({ tipo: "error", texto: "El nombre es obligatorio." });
    setSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        businessName: form.businessName.trim(),
        // Vacío no se envía: el backend exige un teléfono válido si viene.
        phone: form.phone.trim() || undefined,
        address: form.address.trim(),
        communeId: location.communeId,
        commune: location.commune,
        region: location.region,
      });
      setEditing(false);
      setProfileMsg({ tipo: "ok", texto: "Tus datos se actualizaron." });
    } catch (err) {
      setProfileMsg({ tipo: "error", texto: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const guardarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.nueva.length < 8) return setPwMsg({ tipo: "error", texto: "La nueva contraseña debe tener al menos 8 caracteres." });
    if (pw.nueva !== pw.repetir) return setPwMsg({ tipo: "error", texto: "Las contraseñas nuevas no coinciden." });
    setPwSaving(true);
    setPwMsg(null);
    try {
      await changePassword(pw.actual, pw.nueva);
      setPw({ actual: "", nueva: "", repetir: "" });
      setPwOpen(false);
      setPwMsg({ tipo: "ok", texto: "Tu contraseña se cambió." });
    } catch (err) {
      setPwMsg({ tipo: "error", texto: errorMessage(err) });
    } finally {
      setPwSaving(false);
    }
  };

  const campo = (key: keyof typeof form, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`perfil-${key}`} className="label">
        {label}
      </label>
      <input
        id={`perfil-${key}`}
        className="input"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        {...extra}
      />
    </div>
  );

  const ubicacion = [user.commune, user.region].filter(Boolean).join(", ");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <div className="page-head">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Mi cuenta</h1>
        <button type="button" onClick={logout} className="btn-secondary hover:text-red-600 hover:border-red-300">
          Cerrar sesión
        </button>
      </div>

      <section className="panel p-6 flex items-center gap-4">
        <div
          aria-hidden="true"
          className="w-14 h-14 shrink-0 rounded-full bg-brand-600 text-white flex items-center justify-center text-lg font-semibold"
        >
          {getInitials(user.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-slate-900 truncate">{user.fullName}</p>
          <p className="text-sm text-slate-500">
            {user.rut ? `RUT ${user.rut}` : "Sin RUT registrado"} · {user.email}
          </p>
        </div>
        {onOpenOrderTracking && (
          <button type="button" onClick={onOpenOrderTracking} className="btn-primary shrink-0">
            Mis órdenes
          </button>
        )}
      </section>

      {profileMsg && !editing && <Aviso tipo={profileMsg.tipo}>{profileMsg.texto}</Aviso>}

      <Section
        title="Datos de contacto"
        action={
          !editing && (
            <button type="button" onClick={empezarEdicion} className="btn-ghost text-brand-600">
              Modificar
            </button>
          )
        }
      >
        {!editing ? (
          <dl className="divide-y divide-slate-100">
            {user.businessName && <Row label="Razón social" value={user.businessName} />}
            <Row label={user.businessName ? "Contacto" : "Nombre"} value={[user.firstName, user.lastName].filter(Boolean).join(" ")} />
            <Row label="Teléfono" value={user.phone} />
            <Row label="Dirección" value={user.address} />
            <Row label="Comuna" value={ubicacion} />
          </dl>
        ) : (
          <form onSubmit={guardarPerfil} className="p-6 space-y-4">
            {profileMsg && <Aviso tipo={profileMsg.tipo}>{profileMsg.texto}</Aviso>}
            {user.role === "CLIENTE" && campo("businessName", "Razón social (si es empresa)")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campo("firstName", "Nombre *", { autoComplete: "given-name" })}
              {campo("lastName", "Apellidos", { autoComplete: "family-name" })}
            </div>
            {campo("phone", "Teléfono", { type: "tel", autoComplete: "tel" })}
            {campo("address", "Dirección", { autoComplete: "street-address" })}
            <CommuneSelect idPrefix="perfil" value={location} onChange={setLocation} />
            <p className="text-xs text-slate-500">El RUT y el correo no se pueden cambiar desde el portal.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </Section>

      <Section
        title="Seguridad"
        action={
          !pwOpen && (
            <button type="button" onClick={() => { setPwOpen(true); setPwMsg(null); }} className="btn-ghost text-brand-600">
              Cambiar contraseña
            </button>
          )
        }
      >
        {!pwOpen ? (
          <div className="px-6 py-4 space-y-3">
            {pwMsg && <Aviso tipo={pwMsg.tipo}>{pwMsg.texto}</Aviso>}
            <p className="text-sm text-slate-600">Tu contraseña protege tus pedidos y datos de facturación.</p>
          </div>
        ) : (
          <form onSubmit={guardarPassword} className="p-6 space-y-4">
            {pwMsg && <Aviso tipo={pwMsg.tipo}>{pwMsg.texto}</Aviso>}
            <div>
              <label htmlFor="pw-actual" className="label">
                Contraseña actual
              </label>
              <input
                id="pw-actual"
                type="password"
                className="input"
                autoComplete="current-password"
                value={pw.actual}
                onChange={(e) => setPw((p) => ({ ...p, actual: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="pw-nueva" className="label">
                  Nueva contraseña
                </label>
                <input
                  id="pw-nueva"
                  type="password"
                  className="input"
                  autoComplete="new-password"
                  value={pw.nueva}
                  onChange={(e) => setPw((p) => ({ ...p, nueva: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="pw-repetir" className="label">
                  Repetir nueva contraseña
                </label>
                <input
                  id="pw-repetir"
                  type="password"
                  className="input"
                  autoComplete="new-password"
                  value={pw.repetir}
                  onChange={(e) => setPw((p) => ({ ...p, repetir: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPwOpen(false)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={pwSaving} className="btn-primary">
                {pwSaving ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        )}
      </Section>
    </div>
  );
};

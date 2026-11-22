import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { errorMessage } from "../../../services/api";
import { Brand } from "../../ui/Brand";
import { CommuneSelect, CommuneValue } from "../../ui/CommuneSelect";
import { formatRut, validateRut } from "../../../utils/rutValidator";

interface RegistroProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

/** Mismo criterio que TelefonoUtil del backend: 9 dígitos, con o sin +56. */
const telefonoValido = (tel: string) => /^(\+?56)?\d{9}$/.test(tel.replace(/[\s().-]/g, ""));

export const Registro: React.FC<RegistroProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register } = useAuth();

  const [clientType, setClientType] = useState<"EMPRESA" | "PERSONA">("EMPRESA");
  const [businessName, setBusinessName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+56 9 ");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<CommuneValue>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setError("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const esEmpresa = clientType === "EMPRESA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (esEmpresa && !businessName.trim()) return setError("Ingresa la razón social de la empresa.");
    if (!firstName.trim()) return setError(esEmpresa ? "Ingresa el nombre de la persona de contacto." : "Ingresa tu nombre.");
    if (!validateRut(rut)) return setError("El RUT no es válido. Revisa el número y el dígito verificador.");
    if (!telefonoValido(phone)) return setError("El teléfono debe tener 9 dígitos, por ejemplo +56 9 1234 5678.");
    if (!location.communeId) return setError("Selecciona la región y la comuna de atención.");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (password !== confirmPassword) return setError("Las contraseñas no coinciden.");
    if (!acceptTerms) return setError("Debes aceptar los términos de servicio.");

    setLoading(true);
    try {
      await register({
        rut,
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        businessName: esEmpresa ? businessName.trim() : undefined,
        email: email.trim().toLowerCase(),
        phone,
        password,
        address: address.trim() || undefined,
        communeId: location.communeId,
        commune: location.commune,
        region: location.region,
      });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "No pudimos crear la cuenta. Inténtalo nuevamente."));
    } finally {
      setLoading(false);
    }
  };

  const tipoClase = (activo: boolean) =>
    `h-10 px-3 text-sm font-medium rounded-lg border transition-colors ${
      activo ? "bg-brand-50 border-brand-600 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/50 animate-fadeIn overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
        className="relative w-full max-w-lg bg-white rounded-xl shadow-xl p-6 sm:p-8 my-8 animate-slideUp"
      >
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute top-3 right-3 btn-ghost">
          Cerrar
        </button>

        <div className="mb-5">
          <Brand />
        </div>

        <h2 id="register-title" className="text-xl font-semibold text-slate-900">
          Crea tu cuenta de cliente
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          Con tu RUT te reconocemos en la central desde tu primera solicitud.
        </p>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <span className="label">Tipo de cliente</span>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setClientType("EMPRESA")} className={tipoClase(esEmpresa)}>
                Empresa o condominio
              </button>
              <button type="button" onClick={() => setClientType("PERSONA")} className={tipoClase(!esEmpresa)}>
                Persona
              </button>
            </div>
          </div>

          {esEmpresa && (
            <div>
              <label htmlFor="reg-razon" className="label">
                Razón social *
              </label>
              <input
                id="reg-razon"
                className="input"
                placeholder="Inversiones Eléctricas SpA"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-nombre" className="label">
                {esEmpresa ? "Nombre de contacto *" : "Nombre *"}
              </label>
              <input id="reg-nombre" className="input" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="reg-apellidos" className="label">
                Apellidos
              </label>
              <input id="reg-apellidos" className="input" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-rut" className="label">
                {esEmpresa ? "RUT de la empresa *" : "RUT *"}
              </label>
              <input id="reg-rut" className="input" placeholder="76.123.456-7" value={rut} onChange={(e) => setRut(formatRut(e.target.value))} />
            </div>
            <div>
              <label htmlFor="reg-telefono" className="label">
                Teléfono *
              </label>
              <input id="reg-telefono" type="tel" className="input" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="label">
              Correo electrónico *
            </label>
            <input
              id="reg-email"
              type="email"
              className="input"
              autoComplete="email"
              placeholder="contacto@empresa.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="reg-direccion" className="label">
              Dirección
            </label>
            <input
              id="reg-direccion"
              className="input"
              autoComplete="street-address"
              placeholder="Av. Providencia 1234, of. 602"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <CommuneSelect idPrefix="reg" required value={location} onChange={setLocation} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-pass" className="label">
                Contraseña *
              </label>
              <input
                id="reg-pass"
                type="password"
                className="input"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-pass2" className="label">
                Repetir contraseña *
              </label>
              <input
                id="reg-pass2"
                type="password"
                className="input"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 accent-brand-600"
            />
            <span className="text-xs text-slate-500 leading-snug">
              Acepto los términos de servicio y la política de privacidad de DigitalFix.
            </span>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full h-11">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <button type="button" onClick={onSwitchToLogin} className="font-semibold text-brand-600 hover:underline">
            Ingresa aquí
          </button>
        </p>
      </div>
    </div>
  );
};

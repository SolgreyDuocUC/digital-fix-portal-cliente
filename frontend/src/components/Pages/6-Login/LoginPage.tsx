import React, { useEffect, useState } from "react";
import { DEMO_ACCOUNTS, useAuth } from "../../../contexts/AuthContext";
import { ApiError, errorMessage } from "../../../services/api";
import { Brand } from "../../ui/Brand";

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

/** Las cuentas demo solo existen si el backend corre con PORTAL_DATOS_DEMO=true. */
const MOSTRAR_CUENTAS_DEMO = import.meta.env.VITE_MOSTRAR_CUENTAS_DEMO !== "false";

export const LoginPage: React.FC<LoginPageProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  // Limpiar datos sensibles al cerrar
  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setShowPassword(false);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "El correo o la contraseña no coinciden."
          : errorMessage(err, "No pudimos iniciar sesión. Inténtalo nuevamente.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-fadeIn overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative w-full max-w-[400px] bg-white rounded-xl shadow-xl p-8 my-8 animate-slideUp"
      >
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute top-3 right-3 btn-ghost">
          Cerrar
        </button>

        <div className="flex justify-center mb-6">
          <Brand />
        </div>

        <h2 id="login-title" className="text-xl font-semibold text-slate-900">
          Ingresa a tu cuenta
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Clientes y equipo comercial ingresan por aquí.</p>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="label">
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@empresa.cl"
              className="input h-11"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="label">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 mb-1.5"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input h-11"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full h-11">
            {loading ? "Validando..." : "Ingresar"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">¿Eres nuevo?</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button type="button" onClick={onSwitchToRegister} className="btn-secondary w-full h-11">
          Crear cuenta de cliente
        </button>

        {MOSTRAR_CUENTAS_DEMO && (
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="eyebrow mb-2">Cuentas de demostración</p>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {DEMO_ACCOUNTS.map((cuenta) => (
                <li key={cuenta.email}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(cuenta.email);
                      setPassword(cuenta.password);
                      setError("");
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-800">{cuenta.role}</span>
                    <span className="text-[11px] text-slate-500 truncate">{cuenta.email}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-400 mt-2">Elige una para completar el formulario y luego presiona Ingresar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

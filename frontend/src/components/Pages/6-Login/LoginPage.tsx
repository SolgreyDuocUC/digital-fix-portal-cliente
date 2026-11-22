import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Brand } from "../../ui/Brand";
import { Icon } from "../../ui/Icon";

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const inputClass =
  "w-full h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export const LoginPage: React.FC<LoginPageProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cerrar con Escape
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
    } catch {
      setError("No pudimos validar tus datos. Revisa tu correo y contraseña e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative w-full max-w-[400px] bg-white rounded-lg shadow-xl p-8 animate-slideUp"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
        >
          <Icon name="close" size={16} />
        </button>

        <div className="flex justify-center mb-6">
          <Brand />
        </div>

        <h2 id="login-title" className="text-xl font-semibold text-slate-900">
          Ingresa a tu cuenta
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Usa el correo con el que registraste tu empresa.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
          <div>
            <label htmlFor="login-email" className="block text-sm text-slate-700 mb-1.5">
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
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-sm text-slate-700">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-xs text-blue-600 hover:text-blue-700 transition"
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
              className={inputClass}
            />
            <button
              type="button"
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 transition"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
          >
            {loading ? "Validando..." : "Ingresar"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">¿Eres nuevo?</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={onSwitchToRegister}
          className="w-full h-11 rounded-md border border-slate-300 hover:border-blue-600 hover:text-blue-700 text-slate-700 text-sm font-semibold transition"
        >
          Crear cuenta de empresa
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-6">
          Conexión segura · Tus datos están protegidos
        </p>

        {/* Acceso demo solo para pruebas: eliminar en producción */}
        <button
          type="button"
          onClick={() => {
            setEmail("contacto@comercialrojas.cl");
            setPassword("demo1234");
          }}
          className="block mx-auto mt-2 text-[11px] text-slate-400 hover:text-blue-600 transition"
        >
          Usar cuenta de demostración
        </button>
      </div>
    </div>
  );
};
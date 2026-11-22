/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del backend del portal si no se usa el proxy de Vite (por defecto, la misma origin). */
  readonly VITE_API_URL?: string;
  /** "false" oculta las cuentas de demostración en el login. */
  readonly VITE_MOSTRAR_CUENTAS_DEMO?: string;
}

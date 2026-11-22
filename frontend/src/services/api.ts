/**
 * Cliente HTTP del backend del portal (/api/v1).
 *
 * - Adjunta el access token de la sesión.
 * - Si el backend responde 401 y hay refresh token, renueva la sesión una vez y repite la llamada.
 * - Convierte el cuerpo de error del backend ({ status, message, errors }) en ApiError.
 */

const BASE_URL = `${import.meta.env.VITE_API_URL ?? ""}/api/v1`;

const SESSION_KEY = "digitalfix_portal_sesion";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors: string[] = []
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Mensaje para mostrar: el general más el detalle de validación, si lo hay. */
  get detail(): string {
    return this.errors.length > 0 ? `${this.message}: ${this.errors.join(" · ")}` : this.message;
  }
}

/** Evento que se emite cuando la sesión ya no se puede renovar (AuthContext cierra la sesión). */
export const SESSION_EXPIRED_EVENT = "digitalfix:sesion-expirada";

export const sessionStore = {
  get(): StoredSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
      return null;
    }
  },
  set(session: StoredSession): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* almacenamiento no disponible: la sesión dura lo que la pestaña */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** false para rutas públicas que no deben llevar token (login, registro). */
  auth?: boolean;
  signal?: AbortSignal;
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const data = await res.json();
    const message = typeof data?.message === "string" && data.message ? data.message : defaultMessage(res.status);
    return new ApiError(res.status, message, Array.isArray(data?.errors) ? data.errors : []);
  } catch {
    return new ApiError(res.status, defaultMessage(res.status));
  }
}

function defaultMessage(status: number): string {
  if (status === 401) return "Debes iniciar sesión";
  if (status === 403) return "Tu cuenta no tiene permiso para esta acción";
  if (status === 404) return "No encontramos lo que buscas";
  if (status === 503 || status === 502 || status === 504) return "El servicio no está disponible en este momento";
  return "Ocurrió un error inesperado";
}

let refreshing: Promise<boolean> | null = null;

/** Renueva el access token. Varias llamadas simultáneas comparten la misma renovación. */
async function refreshSession(): Promise<boolean> {
  const current = sessionStore.get();
  if (!current?.refreshToken) return false;
  if (!refreshing) {
    refreshing = fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        sessionStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? current.refreshToken });
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth !== false) {
    const token = sessionStore.get()?.accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  try {
    return await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new ApiError(0, "No pudimos conectar con el portal. Revisa tu conexión e inténtalo de nuevo.");
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await send(path, options);

  if (res.status === 401 && options.auth !== false && sessionStore.get()) {
    if (await refreshSession()) {
      res = await send(path, options);
    } else {
      sessionStore.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Mensaje legible de cualquier error de llamada. */
export const errorMessage = (err: unknown, fallback = "Ocurrió un error inesperado"): string =>
  err instanceof ApiError ? err.detail : err instanceof Error && err.message ? err.message : fallback;

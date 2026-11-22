import { ClientUser, LoginCredentials, ProfileUpdate, RegisterData } from "@/types/auth";
import { SystemRole } from "@/types/commercial";
import { api, sessionStore } from "./api";

/** UsuarioDTO del backend. */
interface UsuarioDTO {
  id: number;
  rut: string | null;
  nombre: string;
  apellidos: string | null;
  nombreCompleto: string;
  razonSocial: string | null;
  email: string;
  telefono: string | null;
  direccion: string | null;
  idComuna: number | null;
  comuna: string | null;
  region: string | null;
  rol: string;
}

interface AuthResponse {
  id: number;
  email: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  expiraEnSegundos: number;
  usuario: UsuarioDTO;
}

/** Rol del backend (sin prefijo ROLE_) → rol de las vistas del portal. */
const ROLES: Record<string, SystemRole> = {
  CLIENTE: "CLIENTE",
  VENDEDOR: "VENDEDOR",
  MARKETING: "ASISTENTE_MARKETING",
  JEFE_VENTAS: "JEFE_VENTAS",
};

const DEPARTAMENTOS: Partial<Record<SystemRole, string>> = {
  VENDEDOR: "Ventas en terreno",
  ASISTENTE_MARKETING: "Operaciones comerciales y marketing",
  JEFE_VENTAS: "Jefatura de ventas",
};

const toUser = (u: UsuarioDTO): ClientUser => {
  const role = ROLES[u.rol] ?? "CLIENTE";
  return {
    id: String(u.id),
    email: u.email,
    fullName: u.razonSocial || u.nombreCompleto || [u.nombre, u.apellidos].filter(Boolean).join(" "),
    firstName: u.nombre,
    lastName: u.apellidos ?? undefined,
    businessName: u.razonSocial ?? undefined,
    rut: u.rut ?? "",
    phone: u.telefono ?? "",
    address: u.direccion ?? "",
    role,
    communeId: u.idComuna ?? undefined,
    commune: u.comuna ?? undefined,
    region: u.region ?? undefined,
    department: DEPARTAMENTOS[role],
  };
};

const startSession = (res: AuthResponse): ClientUser => {
  sessionStore.set({ accessToken: res.accessToken, refreshToken: res.refreshToken });
  return toUser(res.usuario);
};

export async function login(credentials: LoginCredentials): Promise<ClientUser> {
  const res = await api<AuthResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email: credentials.email.trim(), password: credentials.password },
  });
  return startSession(res);
}

export async function register(data: RegisterData): Promise<ClientUser> {
  const res = await api<AuthResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: {
      rut: data.rut,
      nombre: data.firstName,
      apellidos: data.lastName || null,
      razonSocial: data.businessName || null,
      email: data.email,
      telefono: data.phone,
      password: data.password,
      direccion: data.address || null,
      idComuna: data.communeId ?? null,
      comuna: data.commune || null,
      region: data.region || null,
    },
  });
  return startSession(res);
}

/** Perfil de la sesión guardada; null si no hay sesión o ya no es válida. */
export async function currentUser(): Promise<ClientUser | null> {
  if (!sessionStore.get()) return null;
  return toUser(await api<UsuarioDTO>("/users/me"));
}

export async function updateProfile(changes: ProfileUpdate): Promise<ClientUser> {
  const dto = await api<UsuarioDTO>("/users/me", {
    method: "PUT",
    body: {
      nombre: changes.firstName,
      apellidos: changes.lastName,
      razonSocial: changes.businessName,
      telefono: changes.phone,
      direccion: changes.address,
      idComuna: changes.communeId,
      comuna: changes.commune,
      region: changes.region,
    },
  });
  return toUser(dto);
}

export async function changePassword(passwordActual: string, passwordNueva: string): Promise<void> {
  await api<void>("/users/me/password", { method: "PUT", body: { passwordActual, passwordNueva, confirmacion: passwordNueva } });
}

export function logout(): void {
  sessionStore.clear();
}

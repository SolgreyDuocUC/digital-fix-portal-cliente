import { SystemRole } from "./commercial";

export interface ClientUser {
  id: string;
  email: string;
  /** Razón social si es empresa; si no, nombre y apellidos. */
  fullName: string;
  firstName: string;
  lastName?: string;
  businessName?: string;
  rut: string;
  phone: string;
  address: string;
  role: SystemRole;
  communeId?: number;
  commune?: string;
  region?: string;
  department?: string;
}

export interface AuthState {
  user: ClientUser | null;
  isAuthenticated: boolean;
  /** true mientras se valida la sesión guardada al abrir el portal. */
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  rut: string;
  firstName: string;
  lastName?: string;
  businessName?: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  communeId?: number;
  commune?: string;
  region?: string;
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  phone?: string;
  address?: string;
  communeId?: number;
  commune?: string;
  region?: string;
}

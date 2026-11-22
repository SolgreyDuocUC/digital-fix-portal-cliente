export interface ClientUser {
  id: string;
  email: string;
  fullName: string;
  rut: string;
  phone: string;
  address: string;
  role: "CLIENTE";
}

export interface AuthState {
  user: ClientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  rut: string;
  phone: string;
  address: string;
  password?: string;
}


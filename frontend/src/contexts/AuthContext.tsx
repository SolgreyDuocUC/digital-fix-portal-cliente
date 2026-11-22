import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthState, ClientUser, LoginCredentials, ProfileUpdate, RegisterData } from "../types/auth";
import * as authService from "../services/authService";
import { ApiError, SESSION_EXPIRED_EVENT } from "../services/api";

interface AuthContextType extends AuthState {
  /** Lanza ApiError si las credenciales no coinciden. El rol sale de la cuenta. */
  login: (credentials: LoginCredentials) => Promise<ClientUser>;
  register: (data: RegisterData) => Promise<ClientUser>;
  updateProfile: (changes: ProfileUpdate) => Promise<ClientUser>;
  logout: () => void;
}

/**
 * Cuentas que crea el backend con PORTAL_DATOS_DEMO=true (config/DataInitializer).
 * El login las ofrece para probar cada rol por el mismo camino que usaría una persona real.
 */
export const DEMO_ACCOUNTS = [
  { role: "Cliente", email: "cliente@digitalfix.cl", password: "Cliente123!" },
  { role: "Vendedor", email: "vendedor@digitalfix.cl", password: "Vendedor123!" },
  { role: "Marketing", email: "marketing@digitalfix.cl", password: "Marketing123!" },
  { role: "Jefe de ventas", email: "jefe@digitalfix.cl", password: "JefeVentas123!" },
] as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Retoma la sesión guardada validándola contra el backend.
  useEffect(() => {
    let vigente = true;
    authService
      .currentUser()
      .then((u) => vigente && setUser(u))
      .catch((err) => {
        // Si el backend no responde se conserva la sesión para reintentar luego; si la rechaza, se cierra.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) authService.logout();
      })
      .finally(() => vigente && setIsLoading(false));
    return () => {
      vigente = false;
    };
  }, []);

  // El cliente HTTP avisa cuando el refresh token tampoco sirve.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const u = await authService.register(data);
    setUser(u);
    return u;
  }, []);

  const updateProfile = useCallback(async (changes: ProfileUpdate) => {
    const u = await authService.updateProfile(changes);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

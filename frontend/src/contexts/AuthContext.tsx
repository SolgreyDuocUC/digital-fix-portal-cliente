import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, ClientUser, LoginCredentials, RegisterData } from "../types/auth";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = "digitalfix_client_token";
const USER_KEY = "digitalfix_client_user";

const DEMO_USER: ClientUser = {
  id: "client-1001",
  fullName: "Comercial Rojas Ltda.",
  email: "contacto@comercialrojas.cl",
  rut: "76.123.456-7",
  phone: "+56 9 8765 4321",
  address: "Av. Providencia 1234, Of. 602, Santiago",
  role: "CLIENTE",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Inicializar con usuario demo activo para fluidez de testing
        setToken("mock-jwt-client-token-digitalfix");
        setUser(DEMO_USER);
        localStorage.setItem(STORAGE_KEY, "mock-jwt-client-token-digitalfix");
        localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER));
      }
    } catch {
      // Ignorar fallas de lectura
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Aislamiento: El cliente se autentica localmente sin consultar Microsoft Entra ID
      const clientUser: ClientUser = {
        ...DEMO_USER,
        email: credentials.email || DEMO_USER.email,
      };
      const generatedToken = "jwt-df-client-" + Date.now();
      setToken(generatedToken);
      setUser(clientUser);
      localStorage.setItem(STORAGE_KEY, generatedToken);
      localStorage.setItem(USER_KEY, JSON.stringify(clientUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser: ClientUser = {
        id: "client-" + Math.floor(Math.random() * 9000 + 1000),
        fullName: data.fullName,
        email: data.email,
        rut: data.rut,
        phone: data.phone,
        address: data.address,
        role: "CLIENTE",
      };
      const generatedToken = "jwt-df-client-" + Date.now();
      setToken(generatedToken);
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, generatedToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};


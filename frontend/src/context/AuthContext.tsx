import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, UserRole } from "../types";
import {
  apiGetMe,
  apiLogin,
  apiRegister,
  getAuthToken,
  setAuthToken,
} from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    skills?: string[];
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  quickLoginAs: (role: UserRole) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiGetMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        setAuthToken(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setUser(null);
      setAuthToken(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password);
      if (data.success && data.token && data.user) {
        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || "Invalid credentials" };
    } catch (err: any) {
      return { success: false, message: err.message || "Login request failed" };
    }
  };

  const register = async (regData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    skills?: string[];
  }) => {
    try {
      const data = await apiRegister(regData);
      if (data.success && data.token && data.user) {
        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || "Registration failed" };
    } catch (err: any) {
      return { success: false, message: err.message || "Registration request failed" };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const quickLoginAs = async (role: UserRole): Promise<boolean> => {
    let email = "";
    let password = "";

    if (role === "admin") {
      email = "admin@resqnet.org";
      password = "admin123";
    } else if (role === "volunteer") {
      email = "volunteer@resqnet.org";
      password = "volunteer123";
    } else {
      email = "citizen@resqnet.org";
      password = "citizen123";
    }

    const res = await login(email, password);
    return res.success;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickLoginAs,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

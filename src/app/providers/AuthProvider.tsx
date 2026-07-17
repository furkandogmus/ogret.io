import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import api from "../api/client";
import axios from "axios";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  avatarUrl?: string;
  phone: string;
  verified: boolean;
  profileComplete: boolean;
  bio?: string;
  education?: string;
  experienceYears?: number;
  hourlyRate?: number;
  ratingAvg?: number;
  ratingCount?: number;
  online: boolean;
  identityVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
  isTutor: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: "STUDENT" | "TUTOR";
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((newUser: AuthUser | null) => {
    setUserState(newUser);
  }, []);

  useEffect(() => {
    axios.post("/api/v1/auth/refresh", undefined, { withCredentials: true })
      .then(() => api.get<AuthUser>("/users/me"))
      .then(({ data }) => setUserState(data))
      .catch(() => setUserState(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    await api.post("/auth/register", registerData);
    setUser(null);
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser,
        isAuthenticated: !!user,
        isTutor: user?.role === "TUTOR",
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

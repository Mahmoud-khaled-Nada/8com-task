// auth-context.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authAPI } from "@/lib/api";
import { User } from "@/utils/types";
import Cookies from "js-cookie";
// ─── Types ──────────────────────────────────────────────
export type UserRole = "admin" | "seller" | "customer";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial check for existing user or attempt refresh
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const refreshToken = typeof window !== "undefined" ? Cookies.get("refresh_token") : undefined;
    if (!refreshToken) {
      localStorage.removeItem("currentUser");
      setUser(null);
      setIsLoading(false);
      return;
    }

    const storedUser = (() => {
      try {
        const raw = localStorage.getItem("currentUser");
        return raw ? (JSON.parse(raw) as User) : null;
      } catch {
        return null;
      }
    })();

    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await authAPI.getCurrentUser({ signal });
        if (res.success) {
          setUser(res.data);
          localStorage.setItem("currentUser", JSON.stringify(res.data));
          return;
        }

        const refresh = await authAPI.refreshToken();
        if (refresh.success) {
          const retry = await authAPI.getCurrentUser({ signal });
          if (retry.success) {
            setUser(retry.data);
            localStorage.setItem("currentUser", JSON.stringify(retry.data));
          } else {
            console.warn("Retry user fetch failed after refresh.");
          }
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("Auth error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    return () => controller.abort();
  }, []);

  // ─── Login ───────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setUser(null); // Reset user state before login attempt
      localStorage.removeItem("currentUser"); // Clear previous user data
      const res = await authAPI.login({ email, password });
      if (res && res.success && res.data) {
        setUser(res.data);
        localStorage.setItem("currentUser", JSON.stringify(res.data));
        return true;
      }
    } catch (err) {
      console.error("Login error:", err);
    }
    return false;
  };

  // ─── Register ────────────────────────────────────────
  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      setUser(null); // Reset user state before login attempt
      localStorage.removeItem("currentUser"); // Clear previous user data
      const res = await authAPI.register({ email, password, name, role });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem("currentUser", JSON.stringify(res.data));
        return true;
      }
    } catch (err) {
      console.error("Register error:", err);
    }
    return false;
  };

  // ─── Logout ──────────────────────────────────────────
  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("currentUser");
      await authAPI.logout();
      setUser(null);
      localStorage.removeItem("currentUser");
      window.location.reload();
    } catch (err) {
      console.warn("Logout failed or already cleared.");
    }
  };

  const hasRole = (role: UserRole): boolean => user?.role === role;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ───────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

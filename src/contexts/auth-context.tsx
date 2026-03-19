"use client";

import {
  createContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { UsuarioInfo, LoginRequest, RegisterRequest } from "@/types";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export interface AuthContextType {
  user: UsuarioInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioInfo | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = authService.getStoredUser();
    return stored && authService.getToken() ? stored : null;
  });
  const [isLoading] = useState(false);
  const router = useRouter();

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await authService.login(data);
      if (res.success && res.data) {
        setUser(res.data.usuario);
        toast.success("Sesión iniciada");
        const rol = res.data.usuario.rol;
        if (rol === "Candidato") {
          router.push("/mis-sesiones");
        } else {
          router.push("/");
        }
      } else {
        toast.error(res.message || "Error al iniciar sesión");
        throw new Error(res.message || "Login failed");
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const res = await authService.register(data);
      if (res.success && res.data) {
        setUser(res.data.usuario);
        toast.success("Cuenta creada exitosamente");
        const rol = res.data.usuario.rol;
        if (rol === "Candidato") {
          router.push("/mis-sesiones");
        } else {
          router.push("/");
        }
      } else {
        toast.error(res.message || "Error al registrarse");
        throw new Error(res.message || "Register failed");
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    toast.success("Sesión cerrada");
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

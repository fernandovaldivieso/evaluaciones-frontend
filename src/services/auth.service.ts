import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/utils/constants";

export const authService = {
  async login(data: LoginRequest) {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data);
    if (res.data.success && res.data.data) {
      const { token, refreshToken, usuario } = res.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    }
    return res.data;
  },

  async register(data: RegisterRequest) {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data);
    if (res.data.success && res.data.data) {
      const { token, refreshToken, usuario } = res.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    }
    return res.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      if (refreshToken) {
        await apiClient.post("/auth/logout", { token: refreshToken });
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getStoredUser() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse["usuario"];
    } catch {
      return null;
    }
  },

  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

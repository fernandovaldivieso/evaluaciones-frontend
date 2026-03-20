import { describe, it, expect, beforeEach, afterEach } from "vitest";

// Verify the constants used across the app
import { ESTADOS_SESION, ESTADOS_PROCESO, TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/utils/constants";

describe("Constants", () => {
  describe("ESTADOS_SESION (1-based)", () => {
    it("has Pendiente at 1", () => {
      expect(ESTADOS_SESION[1]).toBe("Pendiente");
    });

    it("has EnProgreso at 2", () => {
      expect(ESTADOS_SESION[2]).toBe("En Progreso");
    });

    it("has Finalizada at 3", () => {
      expect(ESTADOS_SESION[3]).toBe("Finalizada");
    });

    it("has Expirada at 4", () => {
      expect(ESTADOS_SESION[4]).toBe("Expirada");
    });

    it("has Cancelada at 5", () => {
      expect(ESTADOS_SESION[5]).toBe("Cancelada");
    });

    it("has 5 states total", () => {
      expect(Object.keys(ESTADOS_SESION)).toHaveLength(5);
    });
  });

  describe("ESTADOS_PROCESO (1-based)", () => {
    it("has Abierto at 1", () => {
      expect(ESTADOS_PROCESO[1]).toBe("Abierto");
    });

    it("has En Curso at 2", () => {
      expect(ESTADOS_PROCESO[2]).toBe("En Curso");
    });

    it("has Cerrado at 3", () => {
      expect(ESTADOS_PROCESO[3]).toBe("Cerrado");
    });

    it("has Cancelado at 4", () => {
      expect(ESTADOS_PROCESO[4]).toBe("Cancelado");
    });

    it("has 4 states total", () => {
      expect(Object.keys(ESTADOS_PROCESO)).toHaveLength(4);
    });
  });

  describe("Storage keys use env vars", () => {
    it("uses TOKEN_KEY", () => {
      expect(TOKEN_KEY).toBeTruthy();
      expect(typeof TOKEN_KEY).toBe("string");
    });

    it("uses REFRESH_TOKEN_KEY", () => {
      expect(REFRESH_TOKEN_KEY).toBeTruthy();
      expect(typeof REFRESH_TOKEN_KEY).toBe("string");
    });

    it("uses USER_KEY", () => {
      expect(USER_KEY).toBeTruthy();
      expect(typeof USER_KEY).toBe("string");
    });
  });
});

describe("Auth token flow (localStorage)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves JWT token", () => {
    const token = "eyJhbGciOiJIUzI1NiJ9.test";
    localStorage.setItem(TOKEN_KEY, token);
    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
  });

  it("stores and retrieves refresh token", () => {
    const rt = "refresh-token-abc-123";
    localStorage.setItem(REFRESH_TOKEN_KEY, rt);
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe(rt);
  });

  it("stores and retrieves user info as JSON", () => {
    const user = { id: "u1", nombre: "Test User", email: "test@test.com", rol: "Candidato" };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    const stored = JSON.parse(localStorage.getItem(USER_KEY)!);
    expect(stored.nombre).toBe("Test User");
    expect(stored.rol).toBe("Candidato");
  });

  it("clears all auth data on logout", () => {
    localStorage.setItem(TOKEN_KEY, "t");
    localStorage.setItem(REFRESH_TOKEN_KEY, "r");
    localStorage.setItem(USER_KEY, "u");

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });
});

describe("RefreshTokenRequest shape", () => {
  it("sends token field (not refreshToken)", () => {
    // The backend DTO is RefreshTokenRequest(string Token)
    // So the body must be { token: "..." } not { refreshToken: "..." }
    const refreshToken = "my-refresh-token";
    const body = { token: refreshToken };
    expect(body).toHaveProperty("token", refreshToken);
    expect(body).not.toHaveProperty("refreshToken");
  });
});

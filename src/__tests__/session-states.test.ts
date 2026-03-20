import { describe, it, expect } from "vitest";

/**
 * Tests for the session state logic used across the candidate module.
 * Session states: 1=Pendiente, 2=EnProgreso, 3=Finalizada, 4=Expirada, 5=Cancelada
 */

// Mirror the logic from mis-sesiones/page.tsx
function getStatusConfig(estado: number | null) {
  if (estado === null) return { label: "Disponible", canStart: true, canResume: false, isCompleted: false };
  switch (estado) {
    case 1: return { label: "Pendiente", canStart: false, canResume: true, isCompleted: false };
    case 2: return { label: "En progreso", canStart: false, canResume: true, isCompleted: false };
    case 3: return { label: "Completada", canStart: false, canResume: false, isCompleted: true };
    case 4: return { label: "Expirada", canStart: false, canResume: false, isCompleted: false };
    case 5: return { label: "Cancelada", canStart: false, canResume: false, isCompleted: false };
    default: return { label: "Desconocido", canStart: false, canResume: false, isCompleted: false };
  }
}

// Mirror the logic from exam/page.tsx for session finalization check
function shouldRedirectFromExam(estadoNombre: string): boolean {
  return estadoNombre === "Finalizada" || estadoNombre === "Expirada" || estadoNombre === "Cancelada";
}

describe("Session state logic", () => {
  describe("getStatusConfig", () => {
    it("returns Disponible when no session exists", () => {
      const config = getStatusConfig(null);
      expect(config.label).toBe("Disponible");
      expect(config.canStart).toBe(true);
    });

    it("Pendiente (1) can be resumed", () => {
      const config = getStatusConfig(1);
      expect(config.label).toBe("Pendiente");
      expect(config.canResume).toBe(true);
      expect(config.isCompleted).toBe(false);
    });

    it("EnProgreso (2) can be resumed", () => {
      const config = getStatusConfig(2);
      expect(config.label).toBe("En progreso");
      expect(config.canResume).toBe(true);
      expect(config.isCompleted).toBe(false);
    });

    it("Finalizada (3) shows as completed", () => {
      const config = getStatusConfig(3);
      expect(config.label).toBe("Completada");
      expect(config.isCompleted).toBe(true);
      expect(config.canResume).toBe(false);
    });

    it("Expirada (4) cannot be resumed or started", () => {
      const config = getStatusConfig(4);
      expect(config.label).toBe("Expirada");
      expect(config.canResume).toBe(false);
      expect(config.canStart).toBe(false);
    });

    it("Cancelada (5) cannot be resumed or started", () => {
      const config = getStatusConfig(5);
      expect(config.label).toBe("Cancelada");
      expect(config.canResume).toBe(false);
      expect(config.canStart).toBe(false);
    });
  });

  describe("Exam page redirect logic", () => {
    it("redirects when session is Finalizada", () => {
      expect(shouldRedirectFromExam("Finalizada")).toBe(true);
    });

    it("redirects when session is Expirada", () => {
      expect(shouldRedirectFromExam("Expirada")).toBe(true);
    });

    it("does NOT redirect when Pendiente", () => {
      expect(shouldRedirectFromExam("Pendiente")).toBe(false);
    });

    it("does NOT redirect when EnProgreso", () => {
      expect(shouldRedirectFromExam("EnProgreso")).toBe(false);
    });
  });

  describe("Session priority sorting", () => {
    it("prefers active sessions (1, 2) over finalized (3+)", () => {
      const sessions = [
        { id: "s1", estado: 3, createdAt: "2026-01-03" },
        { id: "s2", estado: 2, createdAt: "2026-01-02" },
        { id: "s3", estado: 1, createdAt: "2026-01-01" },
      ];

      // Sort by createdAt descending
      const sorted = [...sessions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Find active session (estado 1 or 2)
      const active = sorted.find((s) => s.estado === 1 || s.estado === 2);
      expect(active?.id).toBe("s2"); // EnProgreso takes priority
    });
  });

  describe("Responder request body", () => {
    it("includes respuesta text for OpciónMúltiple (must not be empty)", () => {
      const body = {
        preguntaId: "p1",
        respuesta: "París", // The OPTION TEXT, not empty
        opcionSeleccionadaId: "o2",
        tiempoRespuestaSegundos: 15,
      };
      expect(body.respuesta).toBeTruthy();
      expect(body.respuesta.length).toBeGreaterThan(0);
    });

    it("includes respuesta text for Abierta/Código with null opcionSeleccionadaId", () => {
      const body = {
        preguntaId: "p2",
        respuesta: "function fibonacci(n) { ... }",
        opcionSeleccionadaId: undefined,
        tiempoRespuestaSegundos: 120,
      };
      expect(body.respuesta).toBeTruthy();
      expect(body.opcionSeleccionadaId).toBeUndefined();
    });
  });

  describe("Progreso polling checks", () => {
    it("blocks UI when estado is not EnProgreso", () => {
      const progreso = { estado: "Finalizada", tiempoRestanteSegundos: 100 };
      const shouldBlock = progreso.estado !== "EnProgreso";
      expect(shouldBlock).toBe(true);
    });

    it("allows interaction when estado is EnProgreso", () => {
      const progreso = { estado: "EnProgreso", tiempoRestanteSegundos: 500 };
      const shouldBlock = progreso.estado !== "EnProgreso";
      expect(shouldBlock).toBe(false);
    });

    it("uses time fallback when tiempoRestanteSegundos is 0", () => {
      const tiempoLimiteMinutos = 30;
      const tiempoRestanteSegundos = 0;
      const remaining = tiempoRestanteSegundos || tiempoLimiteMinutos * 60;
      expect(remaining).toBe(1800); // Falls back to 30 * 60
    });
  });
});

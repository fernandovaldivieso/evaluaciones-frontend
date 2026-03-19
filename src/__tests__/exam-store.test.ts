import { describe, it, expect } from "vitest";
import { useExamStore } from "@/store/exam-store";
import type { PreguntaDetalleDto } from "@/types";

const mockPreguntas: PreguntaDetalleDto[] = [
  {
    id: "q1",
    texto: "Test question 1",
    tipo: 1,
    tipoNombre: "Opción Múltiple",
    orden: 1,
    puntaje: 10,
    tiempoSegundos: 120,
    explicacion: null,
    opciones: [
      { id: "o1", texto: "A", orden: 1, esCorrecta: false },
      { id: "o2", texto: "B", orden: 2, esCorrecta: true },
      { id: "o3", texto: "C", orden: 3, esCorrecta: false },
    ],
  },
  {
    id: "q2",
    texto: "Test question 2",
    tipo: 2,
    tipoNombre: "Abierta",
    orden: 2,
    puntaje: 10,
    tiempoSegundos: 120,
    explicacion: null,
    opciones: [],
  },
];

describe("exam-store", () => {
  beforeEach(() => {
    useExamStore.getState().reset();
  });

  it("initializes with default values", () => {
    const state = useExamStore.getState();
    expect(state.preguntas).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.answers).toEqual([]);
    expect(state.timeRemaining).toBe(0);
    expect(state.isRunning).toBe(false);
  });

  it("sets preguntas", () => {
    useExamStore.getState().setPreguntas(mockPreguntas);
    expect(useExamStore.getState().preguntas).toEqual(mockPreguntas);
  });

  it("navigates between questions", () => {
    useExamStore.getState().setPreguntas(mockPreguntas);

    useExamStore.getState().nextQuestion();
    expect(useExamStore.getState().currentIndex).toBe(1);

    useExamStore.getState().nextQuestion();
    // Should not exceed bounds
    expect(useExamStore.getState().currentIndex).toBe(1);

    useExamStore.getState().prevQuestion();
    expect(useExamStore.getState().currentIndex).toBe(0);

    useExamStore.getState().prevQuestion();
    // Should not go below 0
    expect(useExamStore.getState().currentIndex).toBe(0);
  });

  it("submits and updates answers", () => {
    useExamStore.getState().setPreguntas(mockPreguntas);

    useExamStore.getState().submitAnswer("q1", "B", "o2");
    expect(useExamStore.getState().answers).toEqual([
      { preguntaId: "q1", respuesta: "B", opcionSeleccionadaId: "o2" },
    ]);

    // Update existing answer
    useExamStore.getState().submitAnswer("q1", "C", "o3");
    expect(useExamStore.getState().answers).toEqual([
      { preguntaId: "q1", respuesta: "C", opcionSeleccionadaId: "o3" },
    ]);

    // Add second answer
    useExamStore.getState().submitAnswer("q2", "Some text");
    expect(useExamStore.getState().answers).toHaveLength(2);
  });

  it("manages timer", () => {
    useExamStore.getState().setTimeRemaining(300);
    expect(useExamStore.getState().timeRemaining).toBe(300);

    useExamStore.getState().start();
    expect(useExamStore.getState().isRunning).toBe(true);

    useExamStore.getState().tick();
    expect(useExamStore.getState().timeRemaining).toBe(299);

    useExamStore.getState().pause();
    expect(useExamStore.getState().isRunning).toBe(false);

    // tick should not decrement when paused
    useExamStore.getState().tick();
    expect(useExamStore.getState().timeRemaining).toBe(299);
  });

  it("stops running when time reaches 0", () => {
    useExamStore.getState().setTimeRemaining(1);
    useExamStore.getState().start();

    useExamStore.getState().tick();
    expect(useExamStore.getState().timeRemaining).toBe(0);

    useExamStore.getState().tick();
    expect(useExamStore.getState().isRunning).toBe(false);
  });

  it("goToQuestion navigates to specific index", () => {
    useExamStore.getState().setPreguntas(mockPreguntas);

    useExamStore.getState().goToQuestion(1);
    expect(useExamStore.getState().currentIndex).toBe(1);

    // Out of bounds should be ignored
    useExamStore.getState().goToQuestion(5);
    expect(useExamStore.getState().currentIndex).toBe(1);

    useExamStore.getState().goToQuestion(-1);
    expect(useExamStore.getState().currentIndex).toBe(1);
  });

  it("reset clears all state", () => {
    useExamStore.getState().setPreguntas(mockPreguntas);
    useExamStore.getState().submitAnswer("q1", "A", "o1");
    useExamStore.getState().setTimeRemaining(300);
    useExamStore.getState().start();

    useExamStore.getState().reset();

    const state = useExamStore.getState();
    expect(state.preguntas).toEqual([]);
    expect(state.answers).toEqual([]);
    expect(state.timeRemaining).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.currentIndex).toBe(0);
  });
});

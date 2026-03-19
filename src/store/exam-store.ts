import { create } from "zustand";
import type { PreguntaDetalleDto, SeccionDetalleDto } from "@/types";

interface ExamAnswer {
  preguntaId: string;
  respuesta: string;
  opcionSeleccionadaId?: string;
}

interface ExamState {
  sesionId: string | null;
  preguntas: PreguntaDetalleDto[];
  secciones: SeccionDetalleDto[];
  currentIndex: number;
  answers: ExamAnswer[];
  timeRemaining: number;
  isRunning: boolean;
  setSesionId: (id: string) => void;
  setPreguntas: (preguntas: PreguntaDetalleDto[]) => void;
  setSecciones: (secciones: SeccionDetalleDto[]) => void;
  setTimeRemaining: (seconds: number) => void;
  tick: () => void;
  start: () => void;
  pause: () => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitAnswer: (preguntaId: string, respuesta: string, opcionSeleccionadaId?: string) => void;
  getAnswer: (preguntaId: string) => ExamAnswer | undefined;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  sesionId: null,
  preguntas: [],
  secciones: [],
  currentIndex: 0,
  answers: [],
  timeRemaining: 0,
  isRunning: false,

  setSesionId: (id) => set({ sesionId: id }),

  setPreguntas: (preguntas) => set({ preguntas }),

  setSecciones: (secciones) => set({ secciones }),

  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  tick: () => {
    const { timeRemaining, isRunning } = get();
    if (isRunning && timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    } else if (timeRemaining <= 0) {
      set({ isRunning: false });
    }
  },

  start: () => set({ isRunning: true }),

  pause: () => set({ isRunning: false }),

  goToQuestion: (index) => {
    const { preguntas } = get();
    if (index >= 0 && index < preguntas.length) {
      set({ currentIndex: index });
    }
  },

  nextQuestion: () => {
    const { currentIndex, preguntas } = get();
    if (currentIndex < preguntas.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  submitAnswer: (preguntaId, respuesta, opcionSeleccionadaId) => {
    const { answers } = get();
    const existing = answers.findIndex((a) => a.preguntaId === preguntaId);
    const newAnswer: ExamAnswer = { preguntaId, respuesta, opcionSeleccionadaId };
    if (existing >= 0) {
      const updated = [...answers];
      updated[existing] = newAnswer;
      set({ answers: updated });
    } else {
      set({ answers: [...answers, newAnswer] });
    }
  },

  getAnswer: (preguntaId) => {
    return get().answers.find((a) => a.preguntaId === preguntaId);
  },

  reset: () =>
    set({
      sesionId: null,
      preguntas: [],
      secciones: [],
      currentIndex: 0,
      answers: [],
      timeRemaining: 0,
      isRunning: false,
    }),
}));

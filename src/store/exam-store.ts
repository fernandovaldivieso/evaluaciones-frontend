import { create } from "zustand";
import type { ExamAnswer, Question } from "@/types";

interface ExamState {
  questions: Question[];
  currentIndex: number;
  answers: ExamAnswer[];
  timeRemaining: number;
  isRunning: boolean;
  setQuestions: (questions: Question[]) => void;
  setTimeRemaining: (seconds: number) => void;
  tick: () => void;
  start: () => void;
  pause: () => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitAnswer: (questionId: string, answer: string) => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  timeRemaining: 0,
  isRunning: false,

  setQuestions: (questions) => set({ questions }),

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
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index });
    }
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  submitAnswer: (questionId, answer) => {
    const { answers } = get();
    const existing = answers.findIndex((a) => a.questionId === questionId);
    if (existing >= 0) {
      const updated = [...answers];
      updated[existing] = { questionId, answer };
      set({ answers: updated });
    } else {
      set({ answers: [...answers, { questionId, answer }] });
    }
  },

  reset: () =>
    set({
      questions: [],
      currentIndex: 0,
      answers: [],
      timeRemaining: 0,
      isRunning: false,
    }),
}));

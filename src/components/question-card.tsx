"use client";

import { useState } from "react";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  currentAnswer?: string;
  onAnswer: (questionId: string, answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionCard({
  question,
  currentAnswer,
  onAnswer,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const [textAnswer, setTextAnswer] = useState(currentAnswer ?? "");

  const handleTextSubmit = () => {
    if (textAnswer.trim()) {
      onAnswer(question.id, textAnswer.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">
          Pregunta {questionNumber} de {totalQuestions}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-gray-500">
          {question.type === "multiple-choice" ? "Opción múltiple" : "Respuesta abierta"}
        </span>
      </div>

      {/* Question text */}
      <h2 className="mb-8 text-lg font-semibold leading-relaxed text-gray-900">
        {question.text}
      </h2>

      {/* Answer area */}
      {question.type === "multiple-choice" && question.options ? (
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = currentAnswer === option;
            return (
              <button
                key={index}
                onClick={() => onAnswer(question.id, option)}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm transition-all duration-200 hover:scale-[1.01] ${
                  isSelected
                    ? "border-primary bg-primary-light text-primary"
                    : "border-slate-200 text-gray-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            rows={5}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textAnswer.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-dark hover:scale-[1.02] active:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Guardar respuesta
          </button>
        </div>
      )}
    </div>
  );
}

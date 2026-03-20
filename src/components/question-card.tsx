"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CheckCircle2, Code, FileText, ListChecks, ToggleLeft } from "lucide-react";
import type { PreguntaParaCandidatoDto } from "@/types";

interface QuestionCardProps {
  question: PreguntaParaCandidatoDto;
  currentAnswer?: string;
  currentOpcionId?: string;
  onAnswer: (preguntaId: string, respuesta: string, opcionSeleccionadaId?: string) => void;
  questionNumber: number;
  totalQuestions: number;
  isSaved?: boolean;
}

const tipoConfig: Record<number, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  1: { label: "Opción múltiple", icon: ListChecks, color: "text-primary", bg: "bg-primary-light" },
  2: { label: "Respuesta abierta", icon: FileText, color: "text-warning", bg: "bg-warning-light" },
  3: { label: "Código", icon: Code, color: "text-accent", bg: "bg-accent-light" },
  4: { label: "Verdadero / Falso", icon: ToggleLeft, color: "text-success", bg: "bg-success-light" },
};

export default function QuestionCard({
  question,
  currentAnswer,
  currentOpcionId,
  onAnswer,
  questionNumber,
  totalQuestions,
  isSaved,
}: QuestionCardProps) {
  const [textAnswer, setTextAnswer] = useState(currentAnswer ?? "");
  const cardRef = useRef<HTMLDivElement>(null);
  const [prevQuestionId, setPrevQuestionId] = useState(question.id);

  if (prevQuestionId !== question.id) {
    setPrevQuestionId(question.id);
    setTextAnswer(currentAnswer ?? "");
  }

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, x: 30, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [question.id]);

  useGSAP(
    () => {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }
    },
    { scope: cardRef }
  );

  const handleTextSubmit = () => {
    if (textAnswer.trim()) {
      onAnswer(question.id, textAnswer.trim());
    }
  };

  const handleTextBlur = () => {
    if (textAnswer.trim() && textAnswer.trim() !== currentAnswer) {
      onAnswer(question.id, textAnswer.trim());
    }
  };

  const tipo = tipoConfig[question.tipo] || tipoConfig[2];
  const TipoIcon = tipo.icon;
  const isMultipleChoice = question.tipo === 1 || question.tipo === 4;
  const isCode = question.tipo === 3;

  return (
    <div ref={cardRef} className="flex w-full flex-col">
      {/* Type header strip */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tipo.bg}`}>
            <TipoIcon className={`h-4 w-4 ${tipo.color}`} />
          </div>
          <div>
            <span className={`text-xs font-medium ${tipo.color}`}>{tipo.label}</span>
            <span className="ml-2 text-xs text-gray-400">
              {question.puntaje} {question.puntaje === 1 ? "punto" : "puntos"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Guardada
            </span>
          )}
          <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-gray-500">
            {questionNumber} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question body */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h2 className="mb-8 text-base font-semibold leading-relaxed text-gray-900 sm:text-lg">
          {question.texto}
        </h2>

        {isMultipleChoice && question.opciones ? (
          <div className="grid gap-3">
            {question.opciones.sort((a, b) => a.orden - b.orden).map((opcion, index) => {
              const isSelected = currentOpcionId === opcion.id;
              const letter = String.fromCharCode(65 + index);
              return (
                <button
                  key={opcion.id}
                  onClick={() => onAnswer(question.id, opcion.texto, opcion.id)}
                  className={`group relative flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-[0_0_0_1px_var(--color-primary)]"
                      : "border-border hover:border-primary/40 hover:bg-primary-50/50"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-white shadow-md"
                        : "bg-surface-alt text-gray-400 group-hover:bg-primary-light group-hover:text-primary"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className={`text-sm transition-colors ${isSelected ? "font-medium text-primary" : "text-gray-700"}`}>
                    {opcion.texto}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              {isCode && (
                <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-gray-900 px-4 py-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                    <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="ml-2 text-xs text-gray-400">Editor</span>
                </div>
              )}
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onBlur={handleTextBlur}
                placeholder={isCode ? "// Escribe tu código aquí..." : "Escribe tu respuesta aquí..."}
                rows={isCode ? 14 : 6}
                maxLength={10000}
                className={`w-full resize-none border border-border p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                  isCode
                    ? "rounded-b-lg bg-gray-950 font-mono text-green-400 placeholder:text-gray-600 caret-green-400 focus:border-green-500 focus:ring-green-500/30"
                    : "rounded-lg bg-surface-alt"
                }`}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {textAnswer.length > 0 ? `${textAnswer.length} caracteres` : ""}
              </span>
              <button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Guardar respuesta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

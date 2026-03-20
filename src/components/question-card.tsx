"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { PreguntaParaCandidatoDto } from "@/types";

interface QuestionCardProps {
  question: PreguntaParaCandidatoDto;
  currentAnswer?: string;
  currentOpcionId?: string;
  onAnswer: (preguntaId: string, respuesta: string, opcionSeleccionadaId?: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

const tipoBadge: Record<number, string> = {
  1: "Opción múltiple",
  2: "Respuesta abierta",
  3: "Código",
  4: "Verdadero/Falso",
};

export default function QuestionCard({
  question,
  currentAnswer,
  currentOpcionId,
  onAnswer,
  questionNumber,
  totalQuestions,
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
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
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

  const isMultipleChoice = question.tipo === 1 || question.tipo === 4;
  const isCode = question.tipo === 3;

  return (
    <div ref={cardRef} className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">
          Pregunta {questionNumber} de {totalQuestions}
        </span>
        <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
          {tipoBadge[question.tipo] || question.tipoNombre}
        </span>
      </div>

      <h2 className="mb-8 text-lg font-semibold leading-relaxed text-gray-900">
        {question.texto}
      </h2>

      {isMultipleChoice && question.opciones ? (
        <div className="space-y-3">
          {question.opciones.sort((a, b) => a.orden - b.orden).map((opcion, index) => {
            const isSelected = currentOpcionId === opcion.id;
            return (
              <button
                key={opcion.id}
                onClick={() => onAnswer(question.id, opcion.texto, opcion.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm transition-all duration-200 hover:scale-[1.01] ${
                  isSelected
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border text-gray-700 hover:border-primary/30 hover:bg-primary-50"
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
                <span>{opcion.texto}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder={isCode ? "Escribe tu código aquí..." : "Escribe tu respuesta aquí..."}
            rows={isCode ? 10 : 5}
            maxLength={10000}
            className={`w-full resize-none rounded-lg border border-border bg-surface-alt p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${isCode ? "font-mono" : ""}`}
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

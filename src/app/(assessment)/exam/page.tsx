"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import QuestionCard from "@/components/question-card";
import { useExamStore } from "@/store/exam-store";
import { mockEvaluations } from "@/data/mock-data";

export default function ExamPage() {
  const {
    questions,
    currentIndex,
    answers,
    setQuestions,
    setTimeRemaining,
    start,
    nextQuestion,
    prevQuestion,
    submitAnswer,
  } = useExamStore();

  // Load the first mock evaluation on mount
  useEffect(() => {
    const evaluation = mockEvaluations[0];
    if (evaluation) {
      setQuestions(evaluation.questions);
      setTimeRemaining(evaluation.duration * 60);
      start();
    }
  }, [setQuestions, setTimeRemaining, start]);

  if (questions.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Cargando evaluación...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion.id
  )?.answer;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <QuestionCard
        question={currentQuestion}
        currentAnswer={currentAnswer}
        onAnswer={submitAnswer}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={prevQuestion}
          disabled={isFirst}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-slate-50 hover:scale-[1.02] active:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        {/* Question dots */}
        <div className="flex items-center gap-1.5">
          {questions.map((q, i) => {
            const isAnswered = answers.some((a) => a.questionId === q.id);
            const isCurrent = i === currentIndex;
            return (
              <div
                key={q.id}
                className={`h-2 w-2 rounded-full transition-all ${
                  isCurrent
                    ? "h-2.5 w-2.5 bg-primary"
                    : isAnswered
                      ? "bg-primary/40"
                      : "bg-gray-300"
                }`}
              />
            );
          })}
        </div>

        {isLast ? (
          <button className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-dark hover:scale-[1.02] active:scale-100">
            <Send className="h-4 w-4" />
            Finalizar
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-slate-50 hover:scale-[1.02] active:scale-100"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Timer from "@/components/timer";
import { useExamStore } from "@/store/exam-store";

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { questions, currentIndex, answers } = useExamStore();
  const progress =
    questions.length > 0 ? (answers.length / questions.length) * 100 : 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold text-primary">
            EvalTech
          </Link>
          <div className="flex items-center gap-4">
            {questions.length > 0 && (
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {questions.length}
              </span>
            )}
            <Timer />
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}

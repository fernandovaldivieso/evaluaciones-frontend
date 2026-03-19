"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import Timer from "@/components/timer";
import { useExamStore } from "@/store/exam-store";
import { revealContent } from "@/lib/animations";
import ProtectedRoute from "@/components/protected-route";

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { preguntas, currentIndex, answers } = useExamStore();
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const progress =
    preguntas.length > 0 ? (answers.length / preguntas.length) * 100 : 0;

  useGSAP(() => {
    if (headerRef.current) revealContent(headerRef.current, { y: -16, duration: 0.4 });
    if (mainRef.current) revealContent(mainRef.current, { delay: 0.15, duration: 0.5 });
  });

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-surface-alt">
        <header ref={headerRef} className="border-b border-border bg-surface">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="text-lg font-semibold text-primary">
              EvalSystem
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              {preguntas.length > 0 && (
                <span className="hidden text-sm text-gray-500 sm:inline">
                  {currentIndex + 1} / {preguntas.length}
                </span>
              )}
              <Timer />
            </div>
          </div>
          <div className="h-1 bg-border-light">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <main ref={mainRef} className="flex flex-1 items-center justify-center p-4 sm:p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

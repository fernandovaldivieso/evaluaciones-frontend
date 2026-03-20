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
  const { preguntas, answers } = useExamStore();
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const progress =
    preguntas.length > 0 ? (answers.length / preguntas.length) * 100 : 0;

  useGSAP(() => {
    if (headerRef.current) revealContent(headerRef.current, { y: -16, duration: 0.4 });
    if (mainRef.current) revealContent(mainRef.current, { delay: 0.15, duration: 0.5 });
  });

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-surface-alt">
        <header ref={headerRef} className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
            <Link href="/" className="text-lg font-semibold text-primary">
              EvalSystem
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              {preguntas.length > 0 && (
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="text-xs text-gray-400">Respondidas</span>
                  <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {answers.length}/{preguntas.length}
                  </span>
                </div>
              )}
              <Timer />
            </div>
          </div>
          <div className="h-1 bg-border-light">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <div ref={mainRef} className="flex flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}

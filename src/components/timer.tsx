"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { useExamStore } from "@/store/exam-store";
import { pulseTimer } from "@/lib/animations";

export default function Timer() {
  const { timeRemaining, isRunning, tick } = useExamStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const isLowTime = timeRemaining <= 60;

  // Pulse animation when time is low
  useGSAP(
    () => {
      if (isLowTime && timerRef.current) {
        tweenRef.current = pulseTimer(timerRef.current);
      }
      return () => {
        tweenRef.current?.kill();
      };
    },
    { dependencies: [isLowTime], scope: timerRef }
  );

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div
      ref={timerRef}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-mono font-semibold transition-colors duration-300 ${
        isLowTime
          ? "border-accent/30 bg-accent-light text-accent"
          : "border-slate-200 bg-white text-gray-700"
      }`}
    >
      <Clock className={`h-4 w-4 ${isLowTime ? "text-accent" : "text-gray-400"}`} />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

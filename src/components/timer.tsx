"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { useExamStore } from "@/store/exam-store";

export default function Timer() {
  const { timeRemaining, isRunning, tick } = useExamStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 60;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-mono font-semibold ${
        isLowTime
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-gray-200 bg-white text-gray-700"
      }`}
    >
      <Clock className={`h-4 w-4 ${isLowTime ? "text-red-500" : "text-gray-400"}`} />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

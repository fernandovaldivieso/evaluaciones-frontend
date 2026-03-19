"use client";

import { useRef } from "react";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { mockResults } from "@/data/mock-data";
import { revealContent, staggerList } from "@/lib/animations";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 75) return "text-primary";
  if (score >= 60) return "text-amber-600";
  return "text-accent";
}

function getMedalIcon(position: number) {
  if (position === 0)
    return <Medal className="h-5 w-5 text-amber-500" />;
  if (position === 1)
    return <Medal className="h-5 w-5 text-gray-400" />;
  if (position === 2)
    return <Medal className="h-5 w-5 text-amber-700" />;
  return (
    <span className="flex h-5 w-5 items-center justify-center text-xs font-semibold text-gray-400">
      {position + 1}
    </span>
  );
}

export default function RankingPage() {
  const sortedResults = [...mockResults].sort((a, b) => b.score - a.score);
  const containerRef = useRef<HTMLDivElement>(null);

  const avgScore =
    sortedResults.length > 0
      ? Math.round(
          sortedResults.reduce((sum, r) => sum + r.score, 0) /
            sortedResults.length
        )
      : 0;

  useGSAP(
    () => {
      if (!containerRef.current) return;
      revealContent(containerRef.current.querySelector("[data-header]"));
      staggerList(
        containerRef.current.querySelectorAll("[data-stat]"),
        { stagger: 0.1 }
      );
      revealContent(containerRef.current.querySelector("[data-table]"), {
        delay: 0.2,
      });
      staggerList(
        containerRef.current.querySelectorAll("[data-row]"),
        { stagger: 0.06, y: 12 }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div data-header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Ranking de Candidatos
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Resultados ordenados por puntuación
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div data-stat className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {sortedResults.length}
              </p>
              <p className="text-sm text-gray-500">Total resultados</p>
            </div>
          </div>
        </div>
        <div data-stat className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {sortedResults[0]?.score ?? 0}%
              </p>
              <p className="text-sm text-gray-500">Mejor puntuación</p>
            </div>
          </div>
        </div>
        <div data-stat className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{avgScore}%</p>
              <p className="text-sm text-gray-500">Promedio general</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div data-table className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Pos.
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Candidato
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Evaluación
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Puntuación
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tiempo
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedResults.map((result, index) => (
                <tr
                  key={result.id}
                  data-row
                  className="transition-colors duration-200 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getMedalIcon(index)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {result.candidateName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {result.candidateEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {result.evaluationTitle}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-semibold ${getScoreColor(result.score)}`}
                    >
                      {result.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatTime(result.timeSpent)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(result.completedAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

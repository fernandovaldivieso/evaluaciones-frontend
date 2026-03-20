"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Medal, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { resultadosService } from "@/services/resultados.service";
import { procesosService } from "@/services/procesos.service";
import type { RankingProcesoDto, ProcesoDto } from "@/types";
import ProtectedRoute from "@/components/protected-route";
import { useRouter } from "next/navigation";

function getScoreColor(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 75) return "text-primary";
  if (score >= 60) return "text-warning";
  return "text-accent";
}

function getMedalIcon(position: number) {
  if (position === 1) return <Medal className="h-5 w-5 text-amber-500" />;
  if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (position === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="flex h-5 w-5 items-center justify-center text-xs font-semibold text-gray-400">{position}</span>;
}

export default function RankingPage() {
  const router = useRouter();
  const [procesos, setProcesos] = useState<ProcesoDto[]>([]);
  const [selectedProcesoId, setSelectedProcesoId] = useState("");
  const [ranking, setRanking] = useState<RankingProcesoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(false);

  const loadProcesos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await procesosService.getAll();
      if (res.success && res.data) {
        setProcesos(res.data);
        if (res.data.length > 0) setSelectedProcesoId(res.data[0].id);
      }
    } catch {
      toast.error("Error al cargar procesos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProcesos(); }, [loadProcesos]);

  const loadRanking = useCallback(async () => {
    if (!selectedProcesoId) return;
    setLoadingRanking(true);
    try {
      const res = await resultadosService.getRanking(selectedProcesoId);
      if (res.success && res.data) setRanking(res.data);
      else setRanking(null);
    } catch {
      toast.error("Error al cargar ranking");
      setRanking(null);
    } finally {
      setLoadingRanking(false);
    }
  }, [selectedProcesoId]);

  useEffect(() => { loadRanking(); }, [loadRanking]);

  const candidates = ranking?.ranking ?? [];
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.scoreTotal, 0) / candidates.length)
    : 0;

  return (
    <ProtectedRoute allowedRoles={["Admin", "Evaluador"]}>
      <div>
        <PageHeader
          breadcrumbs={[{ label: "Inicio", href: "/dashboard" }, { label: "Ranking" }]}
          title="Ranking de Candidatos"
          subtitle="Resultados ordenados por puntuación"
          action={
            <select
              value={selectedProcesoId}
              onChange={(e) => setSelectedProcesoId(e.target.value)}
              className="rounded-xl border border-border bg-surface-alt px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {procesos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          }
        />

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light"><Trophy className="h-5 w-5 text-primary" /></div>
              <div><p className="text-2xl font-semibold text-gray-900">{candidates.length}</p><p className="text-sm text-gray-500">Candidatos</p></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-light"><TrendingUp className="h-5 w-5 text-success" /></div>
              <div><p className="text-2xl font-semibold text-gray-900">{candidates[0]?.scoreTotal.toFixed(1) ?? 0}%</p><p className="text-sm text-gray-500">Mejor puntuación</p></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-light"><TrendingUp className="h-5 w-5 text-warning" /></div>
              <div><p className="text-2xl font-semibold text-gray-900">{avgScore}%</p><p className="text-sm text-gray-500">Promedio</p></div>
            </div>
          </div>
        </div>

        {loading || loadingRanking ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : procesos.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface">
            <Trophy className="h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">No hay procesos creados</p>
            <p className="text-xs text-gray-400">Crea un proceso y asigna candidatos para ver el ranking</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface">
            <AlertCircle className="h-12 w-12 text-gray-300" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">No hay resultados analizados para este proceso</p>
              <p className="text-xs text-gray-400 mt-1">Los candidatos deben completar sus evaluaciones y luego debes analizar sus sesiones</p>
            </div>
            <button
              onClick={() => router.push(`/procesos/${selectedProcesoId}`)}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Ir al proceso
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-primary-50">
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pos.</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Candidato</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Puntuación</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fortalezas</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Brechas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {candidates.map((c) => (
                    <tr key={c.candidatoId} className="hover:bg-primary-50/50">
                      <td className="px-6 py-4">{getMedalIcon(c.posicion)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.candidatoNombre}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${getScoreColor(c.scoreTotal)}`}>{c.scoreTotal.toFixed(1)}%</span>
                          <div className="h-2 w-20 rounded-full bg-border-light">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${c.scoreTotal}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {c.fortalezas ? (
                          <div className="flex flex-wrap gap-1">
                            {c.fortalezas.split(",").map((f) => <span key={f.trim()} className="rounded bg-success-light px-2 py-0.5 text-xs text-success">{f.trim()}</span>)}
                          </div>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {c.brechas ? (
                          <div className="flex flex-wrap gap-1">
                            {c.brechas.split(",").map((b) => <span key={b.trim()} className="rounded bg-accent-light px-2 py-0.5 text-xs text-accent">{b.trim()}</span>)}
                          </div>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

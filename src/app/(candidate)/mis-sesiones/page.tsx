"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Play, Loader2, CheckCircle2, Clock, Trophy,
  ChevronRight, AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { sesionesService } from "@/services/sesiones.service";
import { procesosService } from "@/services/procesos.service";
import type { SesionDto, EvaluacionDto } from "@/types";

interface EvalWithSession {
  evaluacion: EvaluacionDto;
  sesion: SesionDto | null;
}

export default function MisSesionesPage() {
  const router = useRouter();
  const [items, setItems] = useState<EvalWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sesRes, evalRes] = await Promise.all([
        sesionesService.misSesiones(),
        procesosService.getMisEvaluaciones(),
      ]);
      const sesiones: SesionDto[] = sesRes.success && sesRes.data ? sesRes.data : [];
      const evaluaciones: EvaluacionDto[] = evalRes.success && evalRes.data ? evalRes.data : [];

      // Group: for each active evaluation, find the latest session (if any)
      const activas = evaluaciones.filter((e) => e.activa);
      const evalMap: EvalWithSession[] = activas.map((ev) => {
        // Find the latest session for this evaluation — prefer active (1,2) over finalized (3)
        const evSesiones = sesiones
          .filter((s) => s.evaluacionId === ev.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const activeSesion = evSesiones.find((s) => s.estado === 1 || s.estado === 2);
        const sesion = activeSesion || evSesiones[0] || null;
        return { evaluacion: ev, sesion };
      });

      // Also include sessions for evaluations that are no longer active (so the user sees their completed ones)
      const mappedEvalIds = new Set(activas.map((e) => e.id));
      const orphanSesiones = sesiones.filter((s) => !mappedEvalIds.has(s.evaluacionId));
      const orphanGroups = new Map<string, SesionDto>();
      for (const s of orphanSesiones) {
        const existing = orphanGroups.get(s.evaluacionId);
        if (!existing || new Date(s.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
          orphanGroups.set(s.evaluacionId, s);
        }
      }
      for (const s of orphanGroups.values()) {
        evalMap.push({
          evaluacion: {
            id: s.evaluacionId,
            nombre: s.evaluacionNombre,
            tecnologiaNombre: "",
            nivelNombre: "",
            tiempoLimiteMinutos: 0,
            activa: false,
          } as EvaluacionDto,
          sesion: s,
        });
      }

      setItems(evalMap);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleIniciar = async (evaluacionId: string) => {
    setStartingId(evaluacionId);
    try {
      const res = await sesionesService.iniciar({ evaluacionId });
      if (res.success && res.data) {
        router.push(`/exam?sesionId=${res.data.id}`);
      } else {
        toast.error(res.message || "Error al iniciar evaluación");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
      if (axiosErr.response?.status === 403) {
        toast.error(axiosErr.response.data?.message || "No tienes acceso a esta evaluación");
        load();
      } else if (axiosErr.response?.status === 409) {
        toast.info(axiosErr.response.data?.message || "Ya completaste esta evaluación");
        load();
      } else {
        toast.error("No se pudo iniciar la evaluación. Intenta de nuevo.");
      }
    } finally {
      setStartingId(null);
    }
  };

  const handleContinuar = (sesionId: string) => {
    router.push(`/exam?sesionId=${sesionId}`);
  };

  const getStatusConfig = (sesion: SesionDto | null) => {
    if (!sesion) return { label: "Disponible", icon: Play, color: "text-primary", bg: "bg-primary-50" };
    switch (sesion.estado) {
      case 1: return { label: "Pendiente", icon: Clock, color: "text-warning", bg: "bg-warning-light" };
      case 2: return { label: "En progreso", icon: Loader2, color: "text-primary", bg: "bg-primary-light" };
      case 3: return { label: "Completada", icon: CheckCircle2, color: "text-success", bg: "bg-success-light" };
      default: return { label: sesion.estadoNombre, icon: AlertCircle, color: "text-gray-500", bg: "bg-border-light" };
    }
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Inicio", href: "/mis-sesiones" }, { label: "Mis Sesiones" }]}
        title="Mis Evaluaciones"
        subtitle="Visualiza y toma tus evaluaciones asignadas"
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface-alt/50">
          <BookOpen className="h-12 w-12 text-gray-300" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">No tienes evaluaciones asignadas</p>
            <p className="mt-0.5 text-xs text-gray-400">Cuando un reclutador te asigne a un proceso, tus evaluaciones aparecerán aquí</p>
          </div>
        </div>
      ) : (
        <>
          {/* Group by technology */}
          {(() => {
            const groups = new Map<string, EvalWithSession[]>();
            for (const item of items) {
              const tech = item.evaluacion.tecnologiaNombre || "Otras";
              const arr = groups.get(tech) || [];
              arr.push(item);
              groups.set(tech, arr);
            }
            return Array.from(groups.entries()).map(([tech, groupItems]) => (
              <div key={tech} className="mb-8 last:mb-0">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="rounded-md bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">{tech}</span>
                  <span className="text-xs font-normal text-gray-400">{groupItems.length} {groupItems.length === 1 ? "evaluación" : "evaluaciones"}</span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groupItems.map(({ evaluacion: ev, sesion }) => {
            const status = getStatusConfig(sesion);
            const StatusIcon = status.icon;
            const isCompleted = sesion?.estado === 3;
            const canStart = !sesion && ev.activa;
            const canResume = sesion && (sesion.estado === 1 || sesion.estado === 2);
            const isStarting = startingId === ev.id;
            const scorePercent = isCompleted && sesion.scoreMaximo > 0
              ? Math.round((sesion.scoreObtenido ?? 0) / sesion.scoreMaximo * 100)
              : null;

            return (
              <div
                key={ev.id}
                className={`group relative overflow-hidden rounded-2xl border bg-surface shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] ${
                  isCompleted ? "border-success/20" : "border-border"
                }`}
              >

                <div className="p-5">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{ev.nombre}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {ev.tecnologiaNombre && (
                          <span className="rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary">{ev.tecnologiaNombre}</span>
                        )}
                        {ev.nivelNombre && (
                          <span className="rounded-md bg-warning-light px-2 py-0.5 text-[11px] font-medium text-warning">{ev.nivelNombre}</span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon className={`h-3 w-3 ${sesion?.estado === 2 ? "animate-spin" : ""}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Time info */}
                  {ev.tiempoLimiteMinutos > 0 && (
                    <div className="mb-4 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{ev.tiempoLimiteMinutos} minutos</span>
                    </div>
                  )}

                  {/* Score display for completed */}
                  {isCompleted && sesion && (
                    <div className="mb-4 rounded-xl bg-surface-alt p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className={`h-4 w-4 ${(scorePercent ?? 0) >= 70 ? "text-success" : (scorePercent ?? 0) >= 40 ? "text-warning" : "text-accent"}`} />
                          <span className="text-sm font-semibold text-gray-900">{sesion.scoreObtenido} / {sesion.scoreMaximo}</span>
                        </div>
                        <span className={`text-lg font-bold ${(scorePercent ?? 0) >= 70 ? "text-success" : (scorePercent ?? 0) >= 40 ? "text-warning" : "text-accent"}`}>
                          {scorePercent}%
                        </span>
                      </div>
                      {/* Score progress bar */}
                      <div className="mt-2 h-1.5 rounded-full bg-border-light">
                        <div
                          className={`h-full rounded-full transition-all ${(scorePercent ?? 0) >= 70 ? "bg-success" : (scorePercent ?? 0) >= 40 ? "bg-warning" : "bg-accent"}`}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                      {sesion.fechaFin && (
                        <p className="mt-2 text-[11px] text-gray-400">
                          Completada el {new Date(sesion.fechaFin).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action button */}
                  {canStart && (
                    <button
                      onClick={() => handleIniciar(ev.id)}
                      disabled={isStarting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-dark disabled:opacity-50"
                    >
                      {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      {isStarting ? "Iniciando..." : "Iniciar evaluación"}
                    </button>
                  )}
                  {canResume && (
                    <button
                      onClick={() => handleContinuar(sesion!.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-dark"
                    >
                      <ChevronRight className="h-4 w-4" />
                      {sesion!.estado === 1 ? "Comenzar" : "Continuar"}
                    </button>
                  )}
                  {isCompleted && (
                    <button
                      onClick={() => router.push(`/mis-sesiones/resultado/${sesion!.id}`)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-success-light/50 py-2 text-xs font-medium text-success transition-all hover:bg-success-light"
                    >
                      <Trophy className="h-3.5 w-3.5" />
                      Ver resultado
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
            ));
          })()}
        </>
      )}
    </div>
  );
}

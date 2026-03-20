"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Send, Loader2, Flag, Grid3X3,
  CheckCircle2, Circle, X,
} from "lucide-react";
import { toast } from "sonner";
import QuestionCard from "@/components/question-card";
import { useExamStore } from "@/store/exam-store";
import { sesionesService } from "@/services/sesiones.service";
import { startConnection, joinSesion, leaveSesion, stopConnection, getSesionConnection } from "@/lib/signalr-client";
import type { PreguntaParaCandidatoDto } from "@/types";

export default function ExamPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sesionId = searchParams.get("sesionId");

  const {
    preguntas,
    currentIndex,
    answers,
    timeRemaining,
    isRunning,
    setSesionId,
    setPreguntas,
    setTimeRemaining,
    start,
    nextQuestion,
    prevQuestion,
    submitAnswer,
    getAnswer,
    reset,
  } = useExamStore();

  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const questionStartTime = useRef(Date.now());
  const autoFinalized = useRef(false);
  const examReady = useRef(false);

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => {
      const n = new Set(prev);
      if (n.has(qId)) n.delete(qId); else n.add(qId);
      return n;
    });
  };

  const handleFinish = useCallback(async () => {
    if (!sesionId || finishing) return;
    setFinishing(true);
    try {
      const res = await sesionesService.finalizar(sesionId);
      if (res.success) {
        toast.success("Evaluación finalizada");
        reset();
        router.push("/mis-sesiones");
      } else {
        toast.error(res.message || "Error al finalizar");
      }
    } catch {
      toast.error("Error al finalizar");
    } finally {
      setFinishing(false);
    }
  }, [sesionId, finishing, reset, router]);

  // Auto-finalize when time runs out (only after exam is fully loaded)
  useEffect(() => {
    if (!examReady.current) return;
    if (timeRemaining <= 0 && isRunning === false && preguntas.length > 0 && !autoFinalized.current) {
      autoFinalized.current = true;
      toast.warning("Tiempo agotado. Finalizando automáticamente...");
      handleFinish();
    }
  }, [timeRemaining, isRunning, preguntas.length, handleFinish]);

  useEffect(() => {
    if (!sesionId) {
      router.push("/mis-sesiones");
      return;
    }

    async function loadExam() {
      setLoading(true);
      try {
        // Get session info
        const sesionRes = await sesionesService.getById(sesionId!);
        if (!sesionRes.success || !sesionRes.data) {
          toast.error("Sesión no encontrada");
          router.push("/mis-sesiones");
          return;
        }

        // If session is already finalized, redirect back
        // Backend: 1=Pendiente, 2=EnProgreso, 3=Finalizada, 4=Expirada, 5=Cancelada
        if (sesionRes.data.estadoNombre === "Finalizada" || sesionRes.data.estadoNombre === "Expirada" || sesionRes.data.estadoNombre === "Cancelada") {
          toast.info("Esta evaluación ya fue completada");
          router.push("/mis-sesiones");
          return;
        }

        const sesion = sesionRes.data;
        setSesionId(sesionId!);

        // Get evaluation detail (safe endpoint — no correct answers)
        const detalleRes = await sesionesService.getEvaluacionParaCandidato(sesion.evaluacionId);
        if (!detalleRes.success || !detalleRes.data) {
          toast.error("Error al cargar evaluación");
          return;
        }

        const detalle = detalleRes.data;
        // Flatten questions across sections
        const allPreguntas: PreguntaParaCandidatoDto[] = [];
        for (const sec of detalle.secciones.sort((a, b) => a.orden - b.orden)) {
          for (const preg of sec.preguntas.sort((a, b) => a.orden - b.orden)) {
            allPreguntas.push(preg);
          }
        }

        // Get progress for time remaining BEFORE setting preguntas
        // (setting preguntas first would trigger a re-render where
        //  timeRemaining=0 + isRunning=false → premature auto-finalize)
        const progreso = await sesionesService.getProgreso(sesionId!);
        if (progreso.success && progreso.data) {
          const remaining = progreso.data.tiempoRestanteSegundos || detalle.tiempoLimiteMinutos * 60;
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(detalle.tiempoLimiteMinutos * 60);
        }

        setPreguntas(allPreguntas);
        start();
        examReady.current = true;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
        if (axiosErr.response?.status === 403) {
          toast.error("No tienes permiso para acceder a esta sesión");
        } else {
          toast.error("Error al cargar la evaluación");
        }
        router.push("/mis-sesiones");
      } finally {
        setLoading(false);
      }
    }

    loadExam();

    return () => {
      // Don't reset on unmount — user might navigate back
    };
  }, [sesionId, router, setSesionId, setPreguntas, setTimeRemaining, start]);

  // Poll progress every 30s to sync server time
  useEffect(() => {
    if (!sesionId || loading) return;
    const interval = setInterval(async () => {
      try {
        const progreso = await sesionesService.getProgreso(sesionId);
        if (progreso.success && progreso.data) {
          // Block UI if session is no longer active
          if (progreso.data.estado !== "EnProgreso") {
            reset();
            toast.info("La sesión ha finalizado");
            router.push("/mis-sesiones");
            return;
          }
          setTimeRemaining(progreso.data.tiempoRestanteSegundos ?? 0);
        }
      } catch {
        // polling failure is non-critical
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [sesionId, loading, setTimeRemaining]);

  // SignalR: connect and listen for expiration/warning events
  useEffect(() => {
    if (!sesionId) return;

    let mounted = true;

    async function connectSignalR() {
      try {
        await startConnection();
        await joinSesion(sesionId!);

        const conn = getSesionConnection();

        conn.on("TiempoAdvertencia", (data: { tiempoRestanteSegundos: number; mensaje: string }) => {
          if (mounted) {
            toast.warning(data.mensaje, { duration: 10000 });
          }
        });

        conn.on("SesionExpirada", (data: { sesionId: string; mensaje: string }) => {
          if (mounted) {
            toast.error(data.mensaje, { duration: 8000 });
            reset();
            router.push("/mis-sesiones");
          }
        });
      } catch {
        // SignalR connection failed — exam still works via polling/timer
      }
    }

    connectSignalR();

    return () => {
      mounted = false;
      leaveSesion(sesionId!).catch(() => {});
      stopConnection().catch(() => {});
    };
  }, [sesionId, reset, router]);

  // Reset timer on question change
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentIndex]);

  const handleAnswer = async (preguntaId: string, respuesta: string, opcionSeleccionadaId?: string) => {
    submitAnswer(preguntaId, respuesta, opcionSeleccionadaId);

    // Send to backend
    if (sesionId) {
      const elapsed = Math.round((Date.now() - questionStartTime.current) / 1000);
      try {
        await sesionesService.responder(sesionId, {
          preguntaId,
          respuesta,
          opcionSeleccionadaId,
          tiempoRespuestaSegundos: elapsed,
        });
        setSavedSet((prev) => new Set(prev).add(preguntaId));
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
        if (axiosErr.response?.status === 409) {
          // Already answered — mark as saved silently
          setSavedSet((prev) => new Set(prev).add(preguntaId));
        } else if (axiosErr.response?.status === 400) {
          toast.error("La sesión ha expirado");
          reset();
          router.push("/mis-sesiones");
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-gray-500">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (preguntas.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">No hay preguntas en esta evaluación.</p>
      </div>
    );
  }

  const currentQuestion = preguntas[currentIndex];
  const answer = getAnswer(currentQuestion.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === preguntas.length - 1;
  const answeredCount = answers.length;
  const flaggedCount = flagged.size;

  return (
    <div className="flex w-full flex-1 overflow-hidden">
      {/* Question Navigator Sidebar — Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface p-4 lg:flex overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Navegación</h3>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" /> {answeredCount} respondidas</span>
            {flaggedCount > 0 && <span className="flex items-center gap-1"><Flag className="h-2.5 w-2.5 text-warning" /> {flaggedCount}</span>}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {preguntas.map((q, i) => {
            const isAnswered = answers.some((a) => a.preguntaId === q.id);
            const isCurrent = i === currentIndex;
            const isFlagged = flagged.has(q.id);
            return (
              <button
                key={q.id}
                onClick={() => useExamStore.getState().goToQuestion(i)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-primary text-white shadow-md ring-2 ring-primary/30"
                    : isAnswered
                      ? "bg-primary/15 text-primary hover:bg-primary/25"
                      : "bg-surface-alt text-gray-400 hover:bg-border-light hover:text-gray-600"
                }`}
              >
                {i + 1}
                {isFlagged && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-warning" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-auto pt-6 space-y-2 text-[11px]">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-3 w-3 rounded bg-primary" /> Actual
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-3 w-3 rounded bg-primary/15" /> Respondida
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-3 w-3 rounded bg-surface-alt" /> Sin responder
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-2 w-2 rounded-full bg-warning" /> Marcada
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
          <QuestionCard
            question={currentQuestion}
            currentAnswer={answer?.respuesta}
            currentOpcionId={answer?.opcionSeleccionadaId}
            onAnswer={handleAnswer}
            questionNumber={currentIndex + 1}
            totalQuestions={preguntas.length}
            isSaved={savedSet.has(currentQuestion.id)}
          />

          {/* Bottom toolbar */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={prevQuestion}
                disabled={isFirst}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-primary-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  flagged.has(currentQuestion.id)
                    ? "border-warning/40 bg-warning-light text-warning"
                    : "border-border bg-surface text-gray-400 hover:text-warning hover:border-warning/30"
                }`}
                title="Marcar para revisar"
              >
                <Flag className="h-4 w-4" />
              </button>

              {/* Mobile nav toggle */}
              <button
                onClick={() => setShowNav(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-primary lg:hidden"
                title="Ver todas las preguntas"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isLast ? (
                <button
                  onClick={handleFinish}
                  disabled={finishing}
                  className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-dark disabled:opacity-50"
                >
                  {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Finalizar
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-primary-50 hover:text-primary"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile question navigator overlay */}
      {showNav && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm lg:hidden">
          <div className="w-full max-h-[70vh] rounded-t-2xl border-t border-border bg-surface p-6 shadow-[var(--shadow-elevated)] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Preguntas</h3>
              <button onClick={() => setShowNav(false)} className="rounded-md p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
              {preguntas.map((q, i) => {
                const isAnswered = answers.some((a) => a.preguntaId === q.id);
                const isCurrent = i === currentIndex;
                const isFlagged = flagged.has(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => { useExamStore.getState().goToQuestion(i); setShowNav(false); }}
                    className={`relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                      isCurrent
                        ? "bg-primary text-white shadow-md"
                        : isAnswered
                          ? "bg-primary/15 text-primary"
                          : "bg-surface-alt text-gray-400"
                    }`}
                  >
                    {i + 1}
                    {isFlagged && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-warning" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Respondida</span>
              <span className="flex items-center gap-1"><Circle className="h-3 w-3" /> Sin responder</span>
              <span className="flex items-center gap-1"><Flag className="h-3 w-3 text-warning" /> Marcada</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

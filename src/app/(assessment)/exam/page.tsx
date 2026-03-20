"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
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
  const questionStartTime = useRef(Date.now());
  const autoFinalized = useRef(false);

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

  // Auto-finalize when time runs out
  useEffect(() => {
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
        if (sesionRes.data.estado === 3) {
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
        setPreguntas(allPreguntas);

        // Get progress for time remaining
        const progreso = await sesionesService.getProgreso(sesionId!);
        if (progreso.success && progreso.data) {
          const remaining = progreso.data.tiempoRestanteSegundos ?? detalle.tiempoLimiteMinutos * 60;
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(detalle.tiempoLimiteMinutos * 60);
        }

        start();
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
      } catch {
        // silently fail — answer is saved locally
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-gray-500">Cargando evaluación...</p>
      </div>
    );
  }

  if (preguntas.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-500">No hay preguntas en esta evaluación.</p>
      </div>
    );
  }

  const currentQuestion = preguntas[currentIndex];
  const answer = getAnswer(currentQuestion.id);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === preguntas.length - 1;

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <QuestionCard
        question={currentQuestion}
        currentAnswer={answer?.respuesta}
        currentOpcionId={answer?.opcionSeleccionadaId}
        onAnswer={handleAnswer}
        questionNumber={currentIndex + 1}
        totalQuestions={preguntas.length}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={prevQuestion}
          disabled={isFirst}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-primary-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        <div className="flex items-center gap-1.5">
          {preguntas.map((q, i) => {
            const isAnswered = answers.some((a) => a.preguntaId === q.id);
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => useExamStore.getState().goToQuestion(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  isCurrent
                    ? "h-3 w-3 bg-primary"
                    : isAnswered
                      ? "bg-primary/40"
                      : "bg-gray-300"
                }`}
              />
            );
          })}
        </div>

        {isLast ? (
          <button
            onClick={handleFinish}
            disabled={finishing}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-dark disabled:opacity-50"
          >
            {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Finalizar
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-primary-50 hover:text-primary"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

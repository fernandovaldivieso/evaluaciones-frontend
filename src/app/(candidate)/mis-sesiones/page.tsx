"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Play, Loader2 } from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { sesionesService } from "@/services/sesiones.service";
import { evaluacionesService } from "@/services/evaluaciones.service";
import type { SesionDto, EvaluacionDto } from "@/types";

export default function MisSesionesPage() {
  const router = useRouter();
  const [sesiones, setSesiones] = useState<SesionDto[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showIniciar, setShowIniciar] = useState(false);
  const [evalId, setEvalId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sesRes, evalRes] = await Promise.all([
        sesionesService.misSesiones(),
        evaluacionesService.getAll(),
      ]);
      if (sesRes.success && sesRes.data) setSesiones(sesRes.data);
      if (evalRes.success && evalRes.data) {
        const activas = evalRes.data.filter((e) => e.activa);
        setEvaluaciones(activas);
        if (activas.length > 0) setEvalId(activas[0].id);
      }
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleIniciar = async () => {
    if (!evalId) return;
    setStarting(true);
    try {
      const res = await sesionesService.iniciar({ evaluacionId: evalId });
      if (res.success && res.data) {
        toast.success("Evaluación iniciada");
        router.push(`/exam?sesionId=${res.data.id}`);
      } else {
        toast.error(res.message || "Error al iniciar");
      }
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setStarting(false);
    }
  };

  const estadoColor = (estado: number) => {
    switch (estado) {
      case 1: return "bg-warning-light text-warning";
      case 2: return "bg-primary-light text-primary";
      case 3: return "bg-success-light text-success";
      default: return "bg-border-light text-gray-500";
    }
  };

  const canResume = (s: SesionDto) => s.estado === 1 || s.estado === 2;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Inicio", href: "/mis-sesiones" }, { label: "Mis Sesiones" }]}
        title="Mis Sesiones"
        subtitle="Visualiza y toma tus evaluaciones"
        action={
          <button onClick={() => setShowIniciar(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
            <Play className="h-4 w-4" /> Iniciar evaluación
          </button>
        }
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : sesiones.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface">
          <BookOpen className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No tienes sesiones aún</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-primary-50">
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Evaluación</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Score</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Inicio</th>
                  <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {sesiones.map((s) => (
                  <tr key={s.id} className="hover:bg-primary-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.evaluacionNombre}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${estadoColor(s.estado)}`}>{s.estadoNombre}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.scoreObtenido !== null ? `${s.scoreObtenido}/${s.scoreMaximo}` : "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.fechaInicio ? new Date(s.fechaInicio).toLocaleString("es-ES") : "—"}</td>
                    <td className="px-6 py-4 text-right">
                      {canResume(s) && (
                        <button onClick={() => router.push(`/exam?sesionId=${s.id}`)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark">
                          {s.estado === 1 ? "Iniciar" : "Continuar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal iniciar */}
      {showIniciar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Iniciar evaluación</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Evaluación</label>
              <select value={evalId} onChange={(e) => setEvalId(e.target.value)} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                {evaluaciones.map((e) => <option key={e.id} value={e.id}>{e.nombre} — {e.tecnologiaNombre} ({e.nivelNombre})</option>)}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowIniciar(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50">Cancelar</button>
              <button onClick={handleIniciar} disabled={starting || !evalId} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {starting && <Loader2 className="h-4 w-4 animate-spin" />} Comenzar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

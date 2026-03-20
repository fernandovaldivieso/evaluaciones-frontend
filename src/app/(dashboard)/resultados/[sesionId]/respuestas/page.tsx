"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Loader2, MessageSquare, CheckCircle2, Code, FileText,
  Save, ChevronDown, ChevronUp,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { sesionesService } from "@/services/sesiones.service";
import { resultadosService } from "@/services/resultados.service";
import type { RespuestaSesionDto } from "@/types";
import { TIPOS_PREGUNTA } from "@/utils/constants";

export default function RespuestasReviewPage() {
  const { sesionId } = useParams<{ sesionId: string }>();
  const [respuestas, setRespuestas] = useState<RespuestaSesionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!sesionId) return;
    setLoading(true);
    try {
      const res = await sesionesService.getRespuestas(sesionId);
      if (res.success && res.data) {
        setRespuestas(res.data);
      } else {
        toast.error(res.message || "Error al cargar respuestas");
      }
    } catch {
      toast.error("Error al cargar respuestas");
    } finally {
      setLoading(false);
    }
  }, [sesionId]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (r: RespuestaSesionDto) => {
    setEditingId(r.id);
    setPuntaje(r.puntajeObtenido ?? 0);
    setComentario(r.comentarioRevisor ?? "");
    setExpandedId(r.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPuntaje(0);
    setComentario("");
  };

  const handleSave = async (respuestaId: string) => {
    if (!sesionId) return;
    setSaving(true);
    try {
      const res = await resultadosService.revisarRespuesta(sesionId, respuestaId, {
        puntajeObtenido: puntaje,
        comentario: comentario || undefined,
      });
      if (res.success) {
        toast.success("Revisión guardada");
        setEditingId(null);
        load();
      } else {
        toast.error(res.message || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar revisión");
    } finally {
      setSaving(false);
    }
  };

  const needsReview = (r: RespuestaSesionDto) => r.tipoPregunta === 2 || r.tipoPregunta === 3;

  const getTypeIcon = (tipo: number) => {
    if (tipo === 3) return <Code className="h-4 w-4" />;
    if (tipo === 2) return <FileText className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingReview = respuestas.filter((r) => needsReview(r) && r.puntajeObtenido === null).length;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Resultado", href: `/resultados/${sesionId}` },
          { label: "Respuestas" },
        ]}
        title="Revisión de Respuestas"
        subtitle={`${respuestas.length} respuestas${pendingReview > 0 ? ` · ${pendingReview} pendientes de revisión` : ""}`}
        backHref={`/resultados/${sesionId}`}
      />

      {respuestas.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">No hay respuestas registradas.</div>
      ) : (
        <div className="space-y-3">
          {respuestas.map((r, idx) => {
            const isExpanded = expandedId === r.id;
            const isEditing = editingId === r.id;
            const reviewed = r.puntajeObtenido !== null;
            const manual = needsReview(r);

            return (
              <div
                key={r.id}
                className={`rounded-xl border bg-surface shadow-[var(--shadow-card)] transition-all ${
                  manual && !reviewed ? "border-warning/40" : "border-border"
                }`}
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-alt text-xs font-semibold text-gray-500">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.preguntaTexto}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        {getTypeIcon(r.tipoPregunta)}
                        {TIPOS_PREGUNTA[r.tipoPregunta] || r.tipoPreguntaNombre}
                      </span>
                      <span>·</span>
                      <span>{r.tiempoRespuestaSegundos}s</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {reviewed ? (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        (r.puntajeObtenido ?? 0) >= r.puntajeMaximo * 0.7
                          ? "bg-success-light text-success"
                          : (r.puntajeObtenido ?? 0) >= r.puntajeMaximo * 0.4
                          ? "bg-warning-light text-warning"
                          : "bg-accent-light text-accent"
                      }`}>
                        {r.puntajeObtenido}/{r.puntajeMaximo}
                      </span>
                    ) : manual ? (
                      <span className="rounded-full bg-warning-light px-2.5 py-1 text-xs font-medium text-warning">
                        Pendiente
                      </span>
                    ) : (
                      <span className="rounded-full bg-border-light px-2.5 py-1 text-xs font-medium text-gray-400">
                        —/{r.puntajeMaximo}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border px-5 pb-5 pt-4">
                    {/* Candidate answer */}
                    <div className="mb-4">
                      <p className="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">Respuesta del candidato</p>
                      <div className={`rounded-lg bg-surface-alt p-3 text-sm text-gray-800 ${r.tipoPregunta === 3 ? "font-mono whitespace-pre-wrap" : ""}`}>
                        {r.respuesta || <span className="italic text-gray-400">Sin respuesta</span>}
                      </div>
                      {r.opcionSeleccionadaTexto && (
                        <p className="mt-1 text-xs text-gray-400">
                          Opción seleccionada: <span className="font-medium text-gray-600">{r.opcionSeleccionadaTexto}</span>
                        </p>
                      )}
                    </div>

                    {/* Existing review comment */}
                    {r.comentarioRevisor && !isEditing && (
                      <div className="mb-4 rounded-lg border border-primary/20 bg-primary-50 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">Comentario del revisor</span>
                        </div>
                        <p className="text-sm text-gray-700">{r.comentarioRevisor}</p>
                      </div>
                    )}

                    {/* Review form (for open/code questions) */}
                    {manual && !isEditing && (
                      <button
                        onClick={() => startEdit(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {reviewed ? "Editar revisión" : "Revisar"}
                      </button>
                    )}

                    {isEditing && (
                      <div className="space-y-3 rounded-lg border border-border bg-surface-alt/50 p-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Puntaje (0 – {r.puntajeMaximo})
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={r.puntajeMaximo}
                            value={puntaje}
                            onChange={(e) => setPuntaje(Math.min(r.puntajeMaximo, Math.max(0, Number(e.target.value))))}
                            className="w-24 rounded-lg border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Comentario <span className="text-gray-400">(opcional)</span>
                          </label>
                          <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            maxLength={2000}
                            rows={3}
                            placeholder="Feedback para esta respuesta..."
                            className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSave(r.id)}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-border-light"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

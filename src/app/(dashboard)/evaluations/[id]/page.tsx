"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Plus, Trash2, ChevronDown, ChevronRight, Loader2, X, Check,
  FileText, Code, ToggleLeft, ListChecks, Clock, Star, MessageSquare,
  HelpCircle, FolderOpen,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { evaluacionesService } from "@/services/evaluaciones.service";
import { TIPOS_PREGUNTA } from "@/utils/constants";
import type { EvaluacionDetalleDto, CreateSeccionDto, CreatePreguntaDto, CreateOpcionDto } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/protected-route";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const TIPO_CONFIG: Record<number, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  1: { icon: ListChecks, color: "text-primary", bg: "bg-primary-50" },
  2: { icon: FileText, color: "text-warning", bg: "bg-warning-light" },
  3: { icon: Code, color: "text-accent", bg: "bg-accent-light" },
  4: { icon: ToggleLeft, color: "text-success", bg: "bg-success-light" },
};

export default function EvaluacionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canEdit = user?.rol === "Admin" || user?.rol === "Evaluador";

  const [detalle, setDetalle] = useState<EvaluacionDetalleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Section form
  const [showSeccionForm, setShowSeccionForm] = useState(false);
  const [secNombre, setSecNombre] = useState("");
  const [secDescripcion, setSecDescripcion] = useState("");
  const [savingSeccion, setSavingSeccion] = useState(false);

  // Question form
  const [showPreguntaForm, setShowPreguntaForm] = useState<string | null>(null);
  const [pregTexto, setPregTexto] = useState("");
  const [pregTipo, setPregTipo] = useState(1);
  const [pregPuntaje, setPregPuntaje] = useState(10);
  const [pregTiempo, setPregTiempo] = useState(120);
  const [pregExplicacion, setPregExplicacion] = useState("");
  const [showExplicacion, setShowExplicacion] = useState(false);
  const [pregOpciones, setPregOpciones] = useState<CreateOpcionDto[]>([
    { texto: "", esCorrecta: true, orden: 0 },
    { texto: "", esCorrecta: false, orden: 1 },
  ]);
  const [savingPregunta, setSavingPregunta] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await evaluacionesService.getDetalle(id);
      if (res.success && res.data) {
        setDetalle(res.data);
        setOpenSections(new Set(res.data.secciones.map((s) => s.id)));
      }
    } catch {
      toast.error("Error al cargar detalle");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => {
      const n = new Set(prev);
      if (n.has(secId)) n.delete(secId); else n.add(secId);
      return n;
    });
  };

  const resetPreguntaForm = () => {
    setPregTexto("");
    setPregExplicacion("");
    setShowExplicacion(false);
    setPregTipo(1);
    setPregPuntaje(10);
    setPregTiempo(120);
    setPregOpciones([
      { texto: "", esCorrecta: true, orden: 0 },
      { texto: "", esCorrecta: false, orden: 1 },
    ]);
  };

  const handleCreateSeccion = async () => {
    if (!secNombre || !id) return;
    setSavingSeccion(true);
    try {
      const data: CreateSeccionDto = { nombre: secNombre, descripcion: secDescripcion || undefined, orden: (detalle?.secciones.length ?? 0) + 1 };
      const res = await evaluacionesService.createSeccion(id, data);
      if (res.success) { toast.success("Sección creada"); setShowSeccionForm(false); setSecNombre(""); setSecDescripcion(""); load(); }
      else toast.error(res.message || "Error");
    } catch { toast.error("Error"); } finally { setSavingSeccion(false); }
  };

  const handleDeleteSeccion = async (seccionId: string) => {
    if (!confirm("¿Eliminar esta sección y sus preguntas?")) return;
    try {
      const res = await evaluacionesService.deleteSeccion(seccionId);
      if (res.success) { toast.success("Sección eliminada"); load(); }
      else toast.error(res.message || "Error");
    } catch { toast.error("Error"); }
  };

  const handleCreatePregunta = async (seccionId: string) => {
    if (!pregTexto) return;
    setSavingPregunta(true);
    try {
      const seccion = detalle?.secciones.find((s) => s.id === seccionId);
      const data: CreatePreguntaDto = {
        texto: pregTexto, tipo: pregTipo, puntaje: pregPuntaje,
        tiempoSegundos: pregTiempo, orden: (seccion?.preguntas.length ?? 0) + 1,
        explicacion: pregExplicacion || undefined,
        opciones: (pregTipo === 1 || pregTipo === 4) ? pregOpciones.filter((o) => o.texto) : undefined,
      };
      const res = await evaluacionesService.createPregunta(seccionId, data);
      if (res.success) {
        toast.success("Pregunta creada");
        setShowPreguntaForm(null);
        resetPreguntaForm();
        load();
      } else toast.error(res.message || "Error");
    } catch { toast.error("Error"); } finally { setSavingPregunta(false); }
  };

  const handleDeletePregunta = async (preguntaId: string) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    try {
      const res = await evaluacionesService.deletePregunta(preguntaId);
      if (res.success) { toast.success("Pregunta eliminada"); load(); }
      else toast.error(res.message || "Error");
    } catch { toast.error("Error"); }
  };

  const addOpcion = () => setPregOpciones([...pregOpciones, { texto: "", esCorrecta: false, orden: pregOpciones.length }]);
  const removeOpcion = (i: number) => setPregOpciones(pregOpciones.filter((_, idx) => idx !== i));
  const setOpcionCorrecta = (i: number) => setPregOpciones(pregOpciones.map((o, idx) => ({ ...o, esCorrecta: idx === i })));

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!detalle) return <div className="text-center text-gray-500 py-12">Evaluación no encontrada</div>;

  const totalPreguntas = detalle.secciones.reduce((sum, s) => sum + s.preguntas.length, 0);
  const totalPuntaje = detalle.secciones.reduce((sum, s) => sum + s.preguntas.reduce((ps, p) => ps + p.puntaje, 0), 0);

  return (
    <ProtectedRoute allowedRoles={["Admin", "Evaluador"]}>
      <div>
        <PageHeader
          breadcrumbs={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Evaluaciones", href: "/evaluations" },
            { label: detalle.nombre },
          ]}
          title={detalle.nombre}
          subtitle={detalle.descripcion || undefined}
          backHref="/evaluations"
          action={
            canEdit ? (
              <button onClick={() => setShowSeccionForm(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
                <Plus className="h-4 w-4" /> Nueva sección
              </button>
            ) : undefined
          }
        >
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">{detalle.tecnologiaNombre}</span>
            <span className="rounded-full bg-warning-light px-2.5 py-1 text-xs font-medium text-warning">{detalle.nivelNombre}</span>
            <span className="text-xs text-gray-500">{detalle.tiempoLimiteMinutos} min</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${detalle.activa ? "bg-success-light text-success" : "bg-border-light text-gray-500"}`}>
              {detalle.activa ? "Activa" : "Inactiva"}
            </span>
          </div>
        </PageHeader>

        {/* Stats summary */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-surface-alt px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><FolderOpen className="h-4 w-4 text-primary" /></div>
            <div><p className="text-lg font-semibold text-gray-900">{detalle.secciones.length}</p><p className="text-[11px] text-gray-400">Secciones</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-surface-alt px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><HelpCircle className="h-4 w-4 text-primary" /></div>
            <div><p className="text-lg font-semibold text-gray-900">{totalPreguntas}</p><p className="text-[11px] text-gray-400">Preguntas</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-surface-alt px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-light"><Star className="h-4 w-4 text-warning" /></div>
            <div><p className="text-lg font-semibold text-gray-900">{totalPuntaje}</p><p className="text-[11px] text-gray-400">Puntos totales</p></div>
          </div>
        </div>

        {/* Secciones */}
        {detalle.secciones.length === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface-alt/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Sin secciones aún</p>
              <p className="mt-0.5 text-xs text-gray-400">Crea la primera sección para comenzar a agregar preguntas</p>
            </div>
            {canEdit && (
              <button onClick={() => setShowSeccionForm(true)} className="mt-1 flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-white hover:bg-primary-dark transition-colors">
                <Plus className="h-3.5 w-3.5" /> Nueva sección
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {detalle.secciones.sort((a, b) => a.orden - b.orden).map((sec, secIdx) => (
              <div key={sec.id} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
                {/* Section header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-surface-alt/50"
                  onClick={() => toggleSection(sec.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                      {secIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{sec.nombre}</h3>
                      <p className="text-[11px] text-gray-400">{sec.preguntas.length} {sec.preguntas.length === 1 ? "pregunta" : "preguntas"} · {sec.preguntas.reduce((s, p) => s + p.puntaje, 0)} pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setShowPreguntaForm(sec.id); resetPreguntaForm(); }}
                          className="flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary-light"
                          title="Nueva pregunta"
                        >
                          <Plus className="h-3.5 w-3.5" /> Pregunta
                        </button>
                        <button onClick={() => handleDeleteSeccion(sec.id)} className="rounded-lg p-1.5 text-gray-300 hover:bg-accent-light hover:text-accent transition-colors" title="Eliminar sección"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    )}
                    {openSections.has(sec.id) ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>

                {openSections.has(sec.id) && (
                  <div className="border-t border-border-light">
                    {/* Questions list */}
                    {sec.preguntas.length === 0 && !showPreguntaForm ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-10">
                        <HelpCircle className="h-8 w-8 text-gray-200" />
                        <p className="text-xs text-gray-400">Sin preguntas en esta sección</p>
                        {canEdit && (
                          <button
                            onClick={() => { setShowPreguntaForm(sec.id); resetPreguntaForm(); }}
                            className="mt-1 text-xs font-medium text-primary hover:underline"
                          >
                            + Agregar primera pregunta
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-border-light">
                        {sec.preguntas.sort((a, b) => a.orden - b.orden).map((preg, pregIdx) => {
                          const tipoConf = TIPO_CONFIG[preg.tipo] || TIPO_CONFIG[1];
                          const TipoIcon = tipoConf.icon;
                          return (
                            <div key={preg.id} className="group px-5 py-4 transition-colors hover:bg-surface-alt/30">
                              <div className="flex items-start gap-3">
                                {/* Question number */}
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-alt text-xs font-semibold text-gray-500">
                                  {pregIdx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  {/* Meta row */}
                                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${tipoConf.bg} ${tipoConf.color}`}>
                                      <TipoIcon className="h-3 w-3" />{preg.tipoNombre}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                      <Star className="h-3 w-3" />{preg.puntaje} pts
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                      <Clock className="h-3 w-3" />{preg.tiempoSegundos}s
                                    </span>
                                  </div>
                                  {/* Question text */}
                                  <p className="text-sm text-gray-800 leading-relaxed">{preg.texto}</p>
                                  {/* Options */}
                                  {preg.opciones && preg.opciones.length > 0 && (
                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                      {preg.opciones.sort((a, b) => a.orden - b.orden).map((op, opIdx) => (
                                        <div key={op.id} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs ${
                                          op.esCorrecta
                                            ? "border-success/30 bg-success-light text-success font-medium"
                                            : "border-border-light bg-surface-alt/50 text-gray-600"
                                        }`}>
                                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                                            op.esCorrecta ? "bg-success text-white" : "bg-border-light text-gray-400"
                                          }`}>
                                            {OPTION_LETTERS[opIdx]}
                                          </span>
                                          <span>{op.texto}</span>
                                          {op.esCorrecta && <Check className="ml-auto h-3.5 w-3.5 shrink-0" />}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {preg.explicacion && (
                                    <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-surface-alt px-3 py-2 text-xs text-gray-500 italic">
                                      <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />{preg.explicacion}
                                    </p>
                                  )}
                                </div>
                                {canEdit && (
                                  <button onClick={() => handleDeletePregunta(preg.id)} className="rounded-lg p-1.5 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-accent-light hover:text-accent"><Trash2 className="h-4 w-4" /></button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ── Inline question form ── */}
                    {showPreguntaForm === sec.id && (
                      <div className="border-t border-border bg-gradient-to-b from-primary-50/40 to-surface">
                        <div className="px-5 py-5">
                          {/* Form header */}
                          <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Plus className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">Nueva pregunta</h4>
                                <p className="text-[11px] text-gray-400">Pregunta #{sec.preguntas.length + 1} en {sec.nombre}</p>
                              </div>
                            </div>
                            <button onClick={() => setShowPreguntaForm(null)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-surface-alt hover:text-gray-600"><X className="h-4 w-4" /></button>
                          </div>

                          {/* Step 1: Question type */}
                          <div className="mb-5">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Tipo de pregunta</label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              {Object.entries(TIPOS_PREGUNTA).map(([k, v]) => {
                                const kNum = Number(k);
                                const conf = TIPO_CONFIG[kNum] || TIPO_CONFIG[1];
                                const Icon = conf.icon;
                                const isSelected = pregTipo === kNum;
                                return (
                                  <button
                                    key={k}
                                    type="button"
                                    onClick={() => setPregTipo(kNum)}
                                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-xs font-medium transition-all ${
                                      isSelected
                                        ? "border-primary bg-primary-50 text-primary shadow-sm"
                                        : "border-border-light bg-surface text-gray-500 hover:border-border hover:bg-surface-alt"
                                    }`}
                                  >
                                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-gray-400"}`} />
                                    <span className="truncate">{v}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Step 2: Question text */}
                          <div className="mb-4">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Enunciado</label>
                            <textarea
                              value={pregTexto}
                              onChange={(e) => setPregTexto(e.target.value)}
                              placeholder="Escribe el enunciado de la pregunta..."
                              maxLength={2000}
                              rows={3}
                              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed placeholder:text-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                            />
                          </div>

                          {/* Step 3: Settings row */}
                          <div className="mb-4 flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
                              <Star className="h-3.5 w-3.5 text-warning" />
                              <label className="text-[11px] text-gray-400">Puntaje</label>
                              <input
                                type="number" value={pregPuntaje} onChange={(e) => setPregPuntaje(Number(e.target.value))} min={1}
                                className="w-14 border-none bg-transparent text-sm font-semibold text-gray-900 focus:outline-none text-center"
                              />
                            </div>
                            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <label className="text-[11px] text-gray-400">Tiempo</label>
                              <input
                                type="number" value={pregTiempo} onChange={(e) => setPregTiempo(Number(e.target.value))} min={0}
                                className="w-16 border-none bg-transparent text-sm font-semibold text-gray-900 focus:outline-none text-center"
                              />
                              <span className="text-[11px] text-gray-400">seg</span>
                            </div>
                          </div>

                          {/* Step 4: Options (for multiple choice / true-false) */}
                          {(pregTipo === 1 || pregTipo === 4) && (
                            <div className="mb-4">
                              <div className="mb-3 flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Opciones de respuesta</label>
                                <button onClick={addOpcion} className="flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary-light">
                                  <Plus className="h-3 w-3" /> Agregar
                                </button>
                              </div>
                              <div className="space-y-2">
                                {pregOpciones.map((op, i) => (
                                  <div key={i} className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all ${
                                    op.esCorrecta
                                      ? "border-success/40 bg-success-light/50"
                                      : "border-border-light bg-surface hover:border-border"
                                  }`}>
                                    <button
                                      type="button"
                                      onClick={() => setOpcionCorrecta(i)}
                                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                                        op.esCorrecta
                                          ? "bg-success text-white shadow-sm"
                                          : "bg-surface-alt text-gray-400 hover:bg-primary-50 hover:text-primary"
                                      }`}
                                      title={op.esCorrecta ? "Respuesta correcta" : "Marcar como correcta"}
                                    >
                                      {op.esCorrecta ? <Check className="h-3.5 w-3.5" /> : OPTION_LETTERS[i]}
                                    </button>
                                    <input
                                      value={op.texto}
                                      onChange={(e) => { const n = [...pregOpciones]; n[i] = { ...n[i], texto: e.target.value }; setPregOpciones(n); }}
                                      placeholder={`Opción ${OPTION_LETTERS[i]}`}
                                      className="flex-1 border-none bg-transparent text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none"
                                    />
                                    {pregOpciones.length > 2 && (
                                      <button onClick={() => removeOpcion(i)} className="rounded-md p-1 text-gray-300 transition-colors hover:text-accent"><X className="h-3.5 w-3.5" /></button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="mt-2 text-[11px] text-gray-400">Haz clic en la letra para marcar la respuesta correcta</p>
                            </div>
                          )}

                          {/* Explicación toggle */}
                          {!showExplicacion ? (
                            <button onClick={() => setShowExplicacion(true)} className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-primary">
                              <MessageSquare className="h-3.5 w-3.5" /> + Agregar explicación (opcional)
                            </button>
                          ) : (
                            <div className="mb-4">
                              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <MessageSquare className="h-3 w-3" /> Explicación
                              </label>
                              <textarea
                                value={pregExplicacion}
                                onChange={(e) => setPregExplicacion(e.target.value)}
                                placeholder="Explicación que se mostrará tras responder..."
                                rows={2}
                                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm placeholder:text-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                              />
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between border-t border-border-light pt-4">
                            <button onClick={() => setShowPreguntaForm(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-surface-alt hover:text-gray-700">
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleCreatePregunta(sec.id)}
                              disabled={savingPregunta || !pregTexto.trim()}
                              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {savingPregunta ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              Crear pregunta
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Section create modal */}
        {showSeccionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevated)]">
              {/* Modal header */}
              <div className="flex items-center gap-3 border-b border-border-light bg-surface-alt/50 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-900">Nueva sección</h2>
                  <p className="text-[11px] text-gray-400">Sección #{(detalle?.secciones.length ?? 0) + 1}</p>
                </div>
                <button onClick={() => setShowSeccionForm(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-surface-alt hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              {/* Modal body */}
              <div className="space-y-4 px-6 py-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Nombre</label>
                  <input
                    value={secNombre}
                    onChange={(e) => setSecNombre(e.target.value)}
                    maxLength={200}
                    placeholder="Ej: Fundamentos de JavaScript"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Descripción <span className="normal-case tracking-normal font-normal">(opcional)</span></label>
                  <textarea
                    value={secDescripcion}
                    onChange={(e) => setSecDescripcion(e.target.value)}
                    rows={2}
                    placeholder="Breve descripción de lo que evalúa esta sección..."
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  />
                </div>
              </div>
              {/* Modal footer */}
              <div className="flex justify-end gap-3 border-t border-border-light bg-surface-alt/30 px-6 py-4">
                <button onClick={() => setShowSeccionForm(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-surface-alt hover:text-gray-700">Cancelar</button>
                <button
                  onClick={handleCreateSeccion}
                  disabled={savingSeccion || !secNombre.trim()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {savingSeccion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Crear sección
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

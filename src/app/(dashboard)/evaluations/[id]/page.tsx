"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronRight, Loader2, X, Check } from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { evaluacionesService } from "@/services/evaluaciones.service";
import { TIPOS_PREGUNTA } from "@/utils/constants";
import type { EvaluacionDetalleDto, CreateSeccionDto, CreatePreguntaDto, CreateOpcionDto } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/protected-route";

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
        toast.success("Pregunta creada"); setShowPreguntaForm(null);
        setPregTexto(""); setPregExplicacion("");
        setPregOpciones([{ texto: "", esCorrecta: true, orden: 0 }, { texto: "", esCorrecta: false, orden: 1 }]);
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
              <button onClick={() => setShowSeccionForm(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
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

        {/* Secciones */}
        {detalle.secciones.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface">
            <p className="text-gray-500">No hay secciones. Crea la primera.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {detalle.secciones.sort((a, b) => a.orden - b.orden).map((sec) => (
              <div key={sec.id} className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between border-b border-border-light px-4 py-3 cursor-pointer" onClick={() => toggleSection(sec.id)}>
                  <div className="flex items-center gap-2">
                    {openSections.has(sec.id) ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <h3 className="text-sm font-semibold text-gray-900">{sec.nombre}</h3>
                    <span className="text-xs text-gray-400">({sec.preguntas.length} preguntas)</span>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setShowPreguntaForm(sec.id); setPregTexto(""); }} className="rounded-md p-1 text-gray-400 hover:text-primary" title="Nueva pregunta"><Plus className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteSeccion(sec.id)} className="rounded-md p-1 text-gray-400 hover:text-accent" title="Eliminar sección"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
                {openSections.has(sec.id) && (
                  <div className="divide-y divide-border-light">
                    {sec.preguntas.sort((a, b) => a.orden - b.orden).map((preg) => (
                      <div key={preg.id} className="px-4 py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">{preg.tipoNombre}</span>
                              <span className="text-xs text-gray-400">{preg.puntaje} pts | {preg.tiempoSegundos}s</span>
                            </div>
                            <p className="text-sm text-gray-900">{preg.texto}</p>
                            {preg.opciones && preg.opciones.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {preg.opciones.sort((a, b) => a.orden - b.orden).map((op) => (
                                  <div key={op.id} className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${op.esCorrecta ? "bg-success-light text-success font-medium" : "text-gray-600"}`}>
                                    {op.esCorrecta && <Check className="h-3 w-3" />}
                                    <span>{op.texto}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {preg.explicacion && <p className="mt-1 text-xs text-gray-400 italic">{preg.explicacion}</p>}
                          </div>
                          {canEdit && (
                            <button onClick={() => handleDeletePregunta(preg.id)} className="ml-2 rounded-md p-1 text-gray-400 hover:text-accent"><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                      </div>
                    ))}
                    {sec.preguntas.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">Sin preguntas</p>}

                    {/* Inline question form */}
                    {showPreguntaForm === sec.id && (
                      <div className="border-t border-border bg-primary-50/30 px-4 py-4">
                        <h4 className="mb-3 text-sm font-semibold text-gray-900">Nueva pregunta</h4>
                        <div className="space-y-3">
                          <textarea value={pregTexto} onChange={(e) => setPregTexto(e.target.value)} placeholder="Texto de la pregunta..." maxLength={2000} rows={2} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div>
                              <label className="mb-1 block text-xs text-gray-500">Tipo</label>
                              <select value={pregTipo} onChange={(e) => setPregTipo(Number(e.target.value))} className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm">
                                {Object.entries(TIPOS_PREGUNTA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-gray-500">Puntaje</label>
                              <input type="number" value={pregPuntaje} onChange={(e) => setPregPuntaje(Number(e.target.value))} min={1} className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm" />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-gray-500">Tiempo (seg)</label>
                              <input type="number" value={pregTiempo} onChange={(e) => setPregTiempo(Number(e.target.value))} min={0} className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm" />
                            </div>
                          </div>
                          <textarea value={pregExplicacion} onChange={(e) => setPregExplicacion(e.target.value)} placeholder="Explicación (opcional)" rows={1} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                          {(pregTipo === 1 || pregTipo === 4) && (
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-700">Opciones</label>
                                <button onClick={addOpcion} className="text-xs text-primary hover:underline">+ Agregar opción</button>
                              </div>
                              <div className="space-y-2">
                                {pregOpciones.map((op, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <input type="radio" checked={op.esCorrecta} onChange={() => setOpcionCorrecta(i)} className="h-4 w-4 text-primary" />
                                    <input value={op.texto} onChange={(e) => { const n = [...pregOpciones]; n[i] = { ...n[i], texto: e.target.value }; setPregOpciones(n); }} placeholder={`Opción ${i + 1}`} className="flex-1 rounded border border-border bg-surface px-2 py-1.5 text-sm" />
                                    {pregOpciones.length > 2 && (
                                      <button onClick={() => removeOpcion(i)} className="text-gray-400 hover:text-accent"><X className="h-4 w-4" /></button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => setShowPreguntaForm(null)} className="rounded-lg border border-border px-3 py-1.5 text-sm text-gray-700 hover:bg-primary-50">Cancelar</button>
                            <button onClick={() => handleCreatePregunta(sec.id)} disabled={savingPregunta} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                              {savingPregunta && <Loader2 className="h-3 w-3 animate-spin" />} Crear
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
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Nueva sección</h2>
                <button onClick={() => setShowSeccionForm(false)} className="rounded-md p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                  <input value={secNombre} onChange={(e) => setSecNombre(e.target.value)} maxLength={200} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea value={secDescripcion} onChange={(e) => setSecDescripcion(e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowSeccionForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50">Cancelar</button>
                <button onClick={handleCreateSeccion} disabled={savingSeccion} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                  {savingSeccion && <Loader2 className="h-4 w-4 animate-spin" />} Crear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

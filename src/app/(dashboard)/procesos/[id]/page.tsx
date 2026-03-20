"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Loader2, X, Users, ClipboardList, Activity, Sparkles, Eye, FileSearch } from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { procesosService } from "@/services/procesos.service";
import { usuariosService } from "@/services/usuarios.service";
import { evaluacionesService } from "@/services/evaluaciones.service";
import { resultadosService } from "@/services/resultados.service";
import { ESTADOS_PROCESO } from "@/utils/constants";
import type { ProcesoDetalleDto, UsuarioDto, EvaluacionDto, UpdateProcesoDto, SesionProcesoDto } from "@/types";
import ProtectedRoute from "@/components/protected-route";

export default function ProcesoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [proceso, setProceso] = useState<ProcesoDetalleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"candidatos" | "evaluaciones" | "sesiones">("candidatos");
  const [sesiones, setSesiones] = useState<SesionProcesoDto[]>([]);

  // Assignment modals
  const [showAsignarCandidatos, setShowAsignarCandidatos] = useState(false);
  const [showAsignarEvaluaciones, setShowAsignarEvaluaciones] = useState(false);
  const [allUsuarios, setAllUsuarios] = useState<UsuarioDto[]>([]);
  const [allEvaluaciones, setAllEvaluaciones] = useState<EvaluacionDto[]>([]);
  const [selectedCandidatos, setSelectedCandidatos] = useState<Set<string>>(new Set());
  const [selectedEvaluaciones, setSelectedEvaluaciones] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await procesosService.getById(id);
      if (res.success && res.data) setProceso(res.data);
    } catch {
      toast.error("Error al cargar proceso");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const loadSesiones = useCallback(async () => {
    if (!id) return;
    try {
      const res = await procesosService.getSesionesProceso(id);
      if (res.success && res.data) setSesiones(res.data);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    if (tab === "sesiones") loadSesiones();
  }, [tab, loadSesiones]);

  const handleEstadoChange = async (nuevoEstado: number) => {
    if (!id) return;
    try {
      const data: UpdateProcesoDto = { estado: nuevoEstado };
      const res = await procesosService.update(id, data);
      if (res.success) { toast.success("Estado actualizado"); load(); }
      else toast.error(res.message || "Error");
    } catch { toast.error("Error"); }
  };

  const openAsignarCandidatos = async () => {
    try {
      const res = await usuariosService.getCandidatos();
      if (res.success && res.data) {
        const asignadoIds = new Set(proceso?.candidatos.map((c) => c.id) ?? []);
        setAllUsuarios(res.data.filter((u) => !asignadoIds.has(u.id)));
      }
    } catch { /* ignore */ }
    setSelectedCandidatos(new Set());
    setShowAsignarCandidatos(true);
  };

  const openAsignarEvaluaciones = async () => {
    try {
      const res = await evaluacionesService.getAll();
      if (res.success && res.data) {
        const asignadaIds = new Set(proceso?.evaluaciones.map((e) => e.id) ?? []);
        setAllEvaluaciones(res.data.filter((e) => e.activa && !asignadaIds.has(e.id)));
      }
    } catch { /* ignore */ }
    setSelectedEvaluaciones(new Set());
    setShowAsignarEvaluaciones(true);
  };

  const handleAsignarCandidatos = async () => {
    if (!id || selectedCandidatos.size === 0) return;
    setSaving(true);
    try {
      const res = await procesosService.asignarCandidatos(id, { candidatoIds: Array.from(selectedCandidatos) });
      if (res.success) { toast.success("Candidatos asignados"); setShowAsignarCandidatos(false); load(); }
      else toast.error(res.message || "Error");
    } catch { toast.error("Error"); } finally { setSaving(false); }
  };

  const handleAsignarEvaluaciones = async () => {
    if (!id || selectedEvaluaciones.size === 0) return;
    setSaving(true);
    try {
      const res = await procesosService.asignarEvaluaciones(id, { evaluacionIds: Array.from(selectedEvaluaciones) });
      if (res.success) { toast.success("Evaluaciones asignadas"); setShowAsignarEvaluaciones(false); load(); }
      else toast.error(res.message || "Error");
    } catch { toast.error("Error"); } finally { setSaving(false); }
  };

  const toggleCandidato = (cId: string) => {
    setSelectedCandidatos((prev) => { const n = new Set(prev); if (n.has(cId)) n.delete(cId); else n.add(cId); return n; });
  };

  const toggleEvaluacion = (eId: string) => {
    setSelectedEvaluaciones((prev) => { const n = new Set(prev); if (n.has(eId)) n.delete(eId); else n.add(eId); return n; });
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!proceso) return <div className="text-center text-gray-500 py-12">Proceso no encontrado</div>;

  return (
    <ProtectedRoute allowedRoles={["Admin", "Evaluador"]}>
      <div>
        <PageHeader
          breadcrumbs={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Procesos", href: "/procesos" },
            { label: proceso.nombre },
          ]}
          title={proceso.nombre}
          subtitle={proceso.descripcion || undefined}
          backHref="/procesos"
          action={
            <select
              value={proceso.estado}
              onChange={(e) => handleEstadoChange(Number(e.target.value))}
              className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {Object.entries(ESTADOS_PROCESO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          }
        >
          <div className="flex flex-wrap gap-2 text-xs">
            {proceso.puesto && <span className="rounded-full bg-primary-light px-2.5 py-1 font-medium text-primary">{proceso.puesto}</span>}
            {proceso.fechaLimite && <span className="text-gray-500">Fecha límite: {new Date(proceso.fechaLimite).toLocaleDateString("es-ES")}</span>}
            <span className="text-gray-400">Creado por: {proceso.creadorNombre}</span>
          </div>
        </PageHeader>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-border">
          <button onClick={() => setTab("candidatos")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "candidatos" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <Users className="inline h-4 w-4 mr-1" /> Candidatos ({proceso.candidatos.length})
          </button>
          <button onClick={() => setTab("evaluaciones")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "evaluaciones" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <ClipboardList className="inline h-4 w-4 mr-1" /> Evaluaciones ({proceso.evaluaciones.length})
          </button>
          <button onClick={() => setTab("sesiones")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "sesiones" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <Activity className="inline h-4 w-4 mr-1" /> Sesiones
          </button>
        </div>

        {/* Content */}
        {tab === "candidatos" && (
          <div>
            <div className="mb-4 flex justify-end">
              <button onClick={openAsignarCandidatos} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                <Plus className="h-4 w-4" /> Asignar candidatos
              </button>
            </div>
            {proceso.candidatos.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-surface text-gray-500 text-sm">Sin candidatos asignados</div>
            ) : (
              <div className="rounded-xl border border-border bg-surface divide-y divide-border-light">
                {proceso.candidatos.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.nombre}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "evaluaciones" && (
          <div>
            <div className="mb-4 flex justify-end">
              <button onClick={openAsignarEvaluaciones} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                <Plus className="h-4 w-4" /> Asignar evaluaciones
              </button>
            </div>
            {proceso.evaluaciones.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-surface text-gray-500 text-sm">Sin evaluaciones asignadas</div>
            ) : (
              <div className="rounded-xl border border-border bg-surface divide-y divide-border-light">
                {proceso.evaluaciones.map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{e.nombre}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary">{e.tecnologiaNombre}</span>
                        <span className="rounded-full bg-warning-light px-2 py-0.5 text-xs text-warning">{e.nivelNombre}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "sesiones" && (
          <div>
            {sesiones.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-surface text-gray-500 text-sm">No hay sesiones iniciadas aún</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-surface">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-alt text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3">Candidato</th>
                      <th className="px-4 py-3">Evaluación</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {sesiones.map((s) => {
                      const pct = s.scorePorcentaje != null ? `${s.scorePorcentaje.toFixed(0)}%` : "—";
                      const estadoColor = s.estado === 3 ? "bg-success-light text-success" : s.estado === 2 ? "bg-primary-light text-primary" : s.estado === 4 ? "bg-accent-light text-accent" : "bg-border-light text-gray-500";
                      return (
                        <tr key={s.sesionId} className="hover:bg-surface-alt/50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{s.candidatoNombre}</p>
                            <p className="text-xs text-gray-400">{s.candidatoEmail}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-700">{s.evaluacionNombre}</p>
                            <p className="text-xs text-gray-400">{s.tecnologiaNombre}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${estadoColor}`}>{s.estadoNombre}</span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {s.scoreObtenido != null ? `${s.scoreObtenido}/${s.scoreMaximo} (${pct})` : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {s.fechaInicio ? new Date(s.fechaInicio).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                            {s.estado === 3 && !s.tieneResultado && (
                              <>
                                <button
                                  onClick={() => router.push(`/resultados/${s.sesionId}/respuestas`)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-surface-alt px-3 py-1 text-xs font-medium text-gray-600 hover:bg-border-light"
                                >
                                  <FileSearch className="h-3 w-3" />
                                  Revisar
                                </button>
                                <button
                                  onClick={async () => {
                                    setAnalyzingId(s.sesionId);
                                    try {
                                      const res = await resultadosService.analizar(s.sesionId);
                                      if (res.success) { toast.success("Análisis generado"); loadSesiones(); }
                                      else toast.error(res.message || "Error al analizar");
                                    } catch { toast.error("Error al generar análisis"); }
                                    finally { setAnalyzingId(null); }
                                  }}
                                  disabled={analyzingId === s.sesionId}
                                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                                >
                                  {analyzingId === s.sesionId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                  Analizar
                                </button>
                              </>
                            )}
                            {s.tieneResultado && (
                              <button
                                onClick={() => router.push(`/resultados/${s.sesionId}`)}
                                className="inline-flex items-center gap-1 rounded-lg bg-primary-light px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                              >
                                <Eye className="h-3 w-3" />
                                Ver resultado
                              </button>
                            )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Asignar Candidatos Modal */}
        {showAsignarCandidatos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)] max-h-[80vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Asignar candidatos</h2>
                <button onClick={() => setShowAsignarCandidatos(false)} className="rounded-md p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              {allUsuarios.length === 0 ? (
                <p className="text-sm text-gray-500">No hay candidatos disponibles</p>
              ) : (
                <div className="space-y-2">
                  {allUsuarios.map((u) => (
                    <label key={u.id} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-primary-50">
                      <input type="checkbox" checked={selectedCandidatos.has(u.id)} onChange={() => toggleCandidato(u.id)} className="h-4 w-4 rounded border-border text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.nombre}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setShowAsignarCandidatos(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50">Cancelar</button>
                <button onClick={handleAsignarCandidatos} disabled={saving || selectedCandidatos.size === 0} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Asignar ({selectedCandidatos.size})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Asignar Evaluaciones Modal */}
        {showAsignarEvaluaciones && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)] max-h-[80vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Asignar evaluaciones</h2>
                <button onClick={() => setShowAsignarEvaluaciones(false)} className="rounded-md p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              {allEvaluaciones.length === 0 ? (
                <p className="text-sm text-gray-500">No hay evaluaciones disponibles</p>
              ) : (
                <div className="space-y-2">
                  {allEvaluaciones.map((ev) => (
                    <label key={ev.id} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-primary-50">
                      <input type="checkbox" checked={selectedEvaluaciones.has(ev.id)} onChange={() => toggleEvaluacion(ev.id)} className="h-4 w-4 rounded border-border text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ev.nombre}</p>
                        <p className="text-xs text-gray-500">{ev.tecnologiaNombre} — {ev.nivelNombre}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setShowAsignarEvaluaciones(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50">Cancelar</button>
                <button onClick={handleAsignarEvaluaciones} disabled={saving || selectedEvaluaciones.size === 0} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Asignar ({selectedEvaluaciones.size})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ClipboardList, Plus, MoreHorizontal, Clock, FileText, Copy, Loader2, X } from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { evaluacionesService } from "@/services/evaluaciones.service";
import { tecnologiasService } from "@/services/tecnologias.service";
import { NIVELES } from "@/utils/constants";
import type { EvaluacionDto, TecnologiaDto, CreateEvaluacionDto } from "@/types";
import { useAuth } from "@/hooks/use-auth";

export default function EvaluationsPage() {
  const { user } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionDto[]>([]);
  const [tecnologias, setTecnologias] = useState<TecnologiaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nivel, setNivel] = useState(1);
  const [tiempo, setTiempo] = useState(30);
  const [tecnologiaId, setTecnologiaId] = useState("");

  const canEdit = user?.rol === "Admin" || user?.rol === "Evaluador";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evalRes, tecRes] = await Promise.all([
        evaluacionesService.getAll(),
        tecnologiasService.getAll(),
      ]);
      if (evalRes.success && evalRes.data) setEvaluaciones(evalRes.data);
      if (tecRes.success && tecRes.data) {
        setTecnologias(tecRes.data.filter((t) => t.activa));
        if (tecRes.data.length > 0 && !tecnologiaId) setTecnologiaId(tecRes.data[0].id);
      }
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [tecnologiaId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!nombre || !tecnologiaId) { toast.error("Completa los campos requeridos"); return; }
    setSaving(true);
    try {
      const data: CreateEvaluacionDto = { nombre, descripcion: descripcion || undefined, nivel, tiempoLimiteMinutos: tiempo, tecnologiaId };
      const res = await evaluacionesService.create(data);
      if (res.success) { toast.success("Evaluación creada"); setShowCreate(false); setNombre(""); setDescripcion(""); load(); }
      else toast.error(res.message || "Error");
    } catch { toast.error("Error al crear"); } finally { setSaving(false); }
  };

  const handleDuplicar = async (id: string) => {
    try {
      const res = await evaluacionesService.duplicar(id);
      if (res.success) { toast.success("Evaluación duplicada"); load(); }
      else toast.error(res.message || "Error");
    } catch { toast.error("Error al duplicar"); }
  };

  const activas = evaluaciones.filter((e) => e.activa).length;
  const inactivas = evaluaciones.length - activas;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Inicio", href: "/dashboard" }, { label: "Evaluaciones" }]}
        title="Evaluaciones"
        subtitle="Administra las evaluaciones técnicas"
        action={
          canEdit ? (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
              <Plus className="h-4 w-4" /> Nueva evaluación
            </button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light"><ClipboardList className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-semibold text-gray-900">{evaluaciones.length}</p><p className="text-sm text-gray-500">Total</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-light"><FileText className="h-5 w-5 text-success" /></div>
            <div><p className="text-2xl font-semibold text-gray-900">{activas}</p><p className="text-sm text-gray-500">Activas</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-light"><Clock className="h-5 w-5 text-warning" /></div>
            <div><p className="text-2xl font-semibold text-gray-900">{inactivas}</p><p className="text-sm text-gray-500">Inactivas</p></div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : evaluaciones.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface">
          <ClipboardList className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No hay evaluaciones</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-primary-50">
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Evaluación</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tecnología</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nivel</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tiempo</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                  <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {evaluaciones.map((ev) => (
                  <tr key={ev.id} className="hover:bg-primary-50/50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{ev.nombre}</p>
                      <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">{ev.descripcion}</p>
                    </td>
                    <td className="px-6 py-4"><span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">{ev.tecnologiaNombre}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-600">{ev.nivelNombre}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ev.tiempoLimiteMinutos} min</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ev.activa ? "bg-success-light text-success" : "bg-border-light text-gray-500"}`}>
                        {ev.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/evaluations/${ev.id}`} className="rounded-md p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary">
                          <MoreHorizontal className="h-4 w-4" />
                        </Link>
                        {canEdit && (
                          <button onClick={() => handleDuplicar(ev.id)} className="rounded-md p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary" title="Duplicar">
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Nueva evaluación</h2>
              <button onClick={() => setShowCreate(false)} className="rounded-md p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={200} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nivel</label>
                  <select value={nivel} onChange={(e) => setNivel(Number(e.target.value))} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                    {Object.entries(NIVELES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Tiempo (min)</label>
                  <input type="number" value={tiempo} onChange={(e) => setTiempo(Number(e.target.value))} min={1} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tecnología</label>
                <select value={tecnologiaId} onChange={(e) => setTecnologiaId(e.target.value)} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  {tecnologias.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50">Cancelar</button>
              <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

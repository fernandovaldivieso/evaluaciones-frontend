"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FolderKanban, Plus, MoreHorizontal, Loader2, X } from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { procesosService } from "@/services/procesos.service";
import type { ProcesoDto, CreateProcesoDto } from "@/types";
import ProtectedRoute from "@/components/protected-route";

export default function ProcesosPage() {
  const [procesos, setProcesos] = useState<ProcesoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [puesto, setPuesto] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await procesosService.getAll();
      if (res.success && res.data) setProcesos(res.data);
    } catch {
      toast.error("Error al cargar procesos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!nombre) { toast.error("El nombre es requerido"); return; }
    setSaving(true);
    try {
      const data: CreateProcesoDto = {
        nombre,
        descripcion: descripcion || undefined,
        puesto: puesto || undefined,
        fechaLimite: fechaLimite || undefined,
      };
      const res = await procesosService.create(data);
      if (res.success) { toast.success("Proceso creado"); setShowCreate(false); setNombre(""); setDescripcion(""); setPuesto(""); setFechaLimite(""); load(); }
      else toast.error(res.message || "Error");
    } catch { toast.error("Error al crear"); } finally { setSaving(false); }
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case "Abierto": return "bg-success-light text-success";
      case "En Curso": return "bg-primary-light text-primary";
      case "Cerrado": return "bg-border-light text-gray-500";
      case "Cancelado": return "bg-accent-light text-accent";
      default: return "bg-border-light text-gray-500";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin", "Evaluador"]}>
      <div>
        <PageHeader
          breadcrumbs={[{ label: "Inicio", href: "/dashboard" }, { label: "Procesos" }]}
          title="Procesos de Selección"
          subtitle="Gestiona los procesos de contratación"
          action={
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
              <Plus className="h-4 w-4" /> Nuevo proceso
            </button>
          }
        />

        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : procesos.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface">
            <FolderKanban className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No hay procesos creados</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-primary-50">
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Puesto</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha límite</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Candidatos</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Evaluaciones</th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {procesos.map((p) => (
                    <tr key={p.id} className="hover:bg-primary-50/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{p.nombre}</p>
                        {p.descripcion && <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">{p.descripcion}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.puesto || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${estadoColor(p.estadoNombre)}`}>{p.estadoNombre}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.fechaLimite ? new Date(p.fechaLimite).toLocaleDateString("es-ES") : "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.totalCandidatos}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.totalEvaluaciones}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/procesos/${p.id}`} className="rounded-md p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary inline-flex">
                          <MoreHorizontal className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Nuevo proceso</h2>
                <button onClick={() => setShowCreate(false)} className="rounded-md p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={200} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Puesto</label>
                  <input value={puesto} onChange={(e) => setPuesto(e.target.value)} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Fecha límite</label>
                  <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
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
    </ProtectedRoute>
  );
}

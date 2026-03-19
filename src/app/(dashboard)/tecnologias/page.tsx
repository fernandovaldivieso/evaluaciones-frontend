"use client";

import { useEffect, useState, useCallback } from "react";
import { Cpu, Plus, Pencil, Loader2, X } from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { tecnologiasService } from "@/services/tecnologias.service";
import type { TecnologiaDto, CreateTecnologiaDto, UpdateTecnologiaDto } from "@/types";
import ProtectedRoute from "@/components/protected-route";

type ModalMode = "create" | "edit" | null;

export default function TecnologiasPage() {
  const [tecnologias, setTecnologias] = useState<TecnologiaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<TecnologiaDto | null>(null);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activa, setActiva] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tecnologiasService.getAll();
      if (res.success && res.data) setTecnologias(res.data);
    } catch {
      toast.error("Error al cargar tecnologías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setModalMode("create"); setSelected(null);
    setNombre(""); setDescripcion(""); setActiva(true);
  };

  const openEdit = (t: TecnologiaDto) => {
    setModalMode("edit"); setSelected(t);
    setNombre(t.nombre); setDescripcion(t.descripcion ?? ""); setActiva(t.activa);
  };

  const closeModal = () => { setModalMode(null); setSelected(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalMode === "create") {
        const data: CreateTecnologiaDto = { nombre, descripcion: descripcion || undefined };
        const res = await tecnologiasService.create(data);
        if (res.success) { toast.success("Tecnología creada"); closeModal(); load(); }
        else toast.error(res.message || "Error");
      } else if (modalMode === "edit" && selected) {
        const data: UpdateTecnologiaDto = { nombre, descripcion: descripcion || undefined, activa };
        const res = await tecnologiasService.update(selected.id, data);
        if (res.success) { toast.success("Tecnología actualizada"); closeModal(); load(); }
        else toast.error(res.message || "Error");
      }
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin", "Evaluador"]}>
      <div>
        <PageHeader
          breadcrumbs={[{ label: "Inicio", href: "/dashboard" }, { label: "Tecnologías" }]}
          title="Tecnologías"
          subtitle="Gestiona las tecnologías disponibles"
          action={
            <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
              <Plus className="h-4 w-4" /> Nueva tecnología
            </button>
          }
        />

        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : tecnologias.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface">
            <Cpu className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No hay tecnologías registradas</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-primary-50">
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Descripción</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Activa</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Creada</th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {tecnologias.map((t) => (
                    <tr key={t.id} className="hover:bg-primary-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{t.descripcion || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${t.activa ? "bg-success-light text-success" : "bg-border-light text-gray-500"}`}>
                          {t.activa ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(t.createdAt).toLocaleDateString("es-ES")}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEdit(t)} className="rounded-md p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{modalMode === "create" ? "Nueva tecnología" : "Editar tecnología"}</h2>
                <button onClick={closeModal} className="rounded-md p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={150} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                {modalMode === "edit" && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Activa</label>
                    <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={closeModal} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

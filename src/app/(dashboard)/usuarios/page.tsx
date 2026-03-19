"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { usuariosService } from "@/services/usuarios.service";
import { ROLES } from "@/utils/constants";
import type { UsuarioDto, CreateUsuarioDto, UpdateUsuarioDto } from "@/types";
import ProtectedRoute from "@/components/protected-route";

type ModalMode = "create" | "edit" | null;

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<UsuarioDto | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState(3);
  const [activo, setActivo] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usuariosService.getAll();
      if (res.success && res.data) setUsuarios(res.data);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setModalMode("create");
    setSelected(null);
    setNombre(""); setEmail(""); setPassword(""); setRol(3); setActivo(true);
  };

  const openEdit = (u: UsuarioDto) => {
    setModalMode("edit");
    setSelected(u);
    setNombre(u.nombre);
    setEmail(u.email);
    setPassword("");
    setRol(Object.entries(ROLES).find(([, v]) => v === u.rol)?.[0] ? Number(Object.entries(ROLES).find(([, v]) => v === u.rol)![0]) : 3);
    setActivo(u.activo);
  };

  const closeModal = () => { setModalMode(null); setSelected(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalMode === "create") {
        const data: CreateUsuarioDto = { nombre, email, password, rol };
        const res = await usuariosService.create(data);
        if (res.success) { toast.success("Usuario creado"); closeModal(); load(); }
        else toast.error(res.message || "Error");
      } else if (modalMode === "edit" && selected) {
        const data: UpdateUsuarioDto = { nombre, email, rol, activo };
        const res = await usuariosService.update(selected.id, data);
        if (res.success) { toast.success("Usuario actualizado"); closeModal(); load(); }
        else toast.error(res.message || "Error");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      const res = await usuariosService.delete(id);
      if (res.success) { toast.success("Usuario eliminado"); load(); }
      else toast.error(res.message || "Error");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <div>
        <PageHeader
          breadcrumbs={[{ label: "Inicio", href: "/dashboard" }, { label: "Usuarios" }]}
          title="Usuarios"
          subtitle="Administra los usuarios del sistema"
          action={
            <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
              <Plus className="h-4 w-4" /> Nuevo usuario
            </button>
          }
        />

        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : usuarios.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface">
            <Users className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-primary-50">
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rol</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Activo</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Creado</th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-primary-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.rol === "Admin" ? "bg-accent-light text-accent" : u.rol === "Evaluador" ? "bg-primary-light text-primary" : "bg-success-light text-success"}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.activo ? "bg-success-light text-success" : "bg-border-light text-gray-500"}`}>
                          {u.activo ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString("es-ES")}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(u)} className="rounded-md p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(u.id)} className="rounded-md p-1.5 text-gray-400 hover:bg-accent-light hover:text-accent"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{modalMode === "create" ? "Nuevo usuario" : "Editar usuario"}</h2>
                <button onClick={closeModal} className="rounded-md p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={200} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={256} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                {modalMode === "create" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} maxLength={128} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Rol</label>
                  <select value={rol} onChange={(e) => setRol(Number(e.target.value))} className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                    {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                {modalMode === "edit" && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Activo</label>
                    <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
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

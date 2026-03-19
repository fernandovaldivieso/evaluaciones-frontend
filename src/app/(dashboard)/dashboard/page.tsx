"use client";

import { useEffect, useState } from "react";
import { Users, Cpu, ClipboardList, FolderKanban, BookOpen, Loader2, TrendingUp, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usuariosService } from "@/services/usuarios.service";
import { tecnologiasService } from "@/services/tecnologias.service";
import { evaluacionesService } from "@/services/evaluaciones.service";
import { procesosService } from "@/services/procesos.service";
import { sesionesService } from "@/services/sesiones.service";
import type { SesionDto } from "@/types";
import PageHeader from "@/components/page-header";

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);

  useEffect(() => {
    async function load() {
      try {
        if (user?.rol === "Admin") {
          const [usuarios, tecnologias, evaluaciones, procesos] = await Promise.all([
            usuariosService.getAll().catch(() => ({ data: [] })),
            tecnologiasService.getAll().catch(() => ({ data: [] })),
            evaluacionesService.getAll().catch(() => ({ data: [] })),
            procesosService.getAll().catch(() => ({ data: [] })),
          ]);
          setStats([
            { label: "Usuarios", value: usuarios.data?.length ?? 0, icon: Users, color: "text-primary", bgColor: "bg-primary-light" },
            { label: "Tecnologías", value: tecnologias.data?.length ?? 0, icon: Cpu, color: "text-success", bgColor: "bg-success-light" },
            { label: "Evaluaciones", value: evaluaciones.data?.length ?? 0, icon: ClipboardList, color: "text-warning", bgColor: "bg-warning-light" },
            { label: "Procesos", value: procesos.data?.length ?? 0, icon: FolderKanban, color: "text-accent", bgColor: "bg-accent-light" },
          ]);
        } else if (user?.rol === "Evaluador") {
          const [evaluaciones, procesos] = await Promise.all([
            evaluacionesService.getAll().catch(() => ({ data: [] })),
            procesosService.getAll().catch(() => ({ data: [] })),
          ]);
          setStats([
            { label: "Evaluaciones", value: evaluaciones.data?.length ?? 0, icon: ClipboardList, color: "text-primary", bgColor: "bg-primary-light" },
            { label: "Procesos", value: procesos.data?.length ?? 0, icon: FolderKanban, color: "text-success", bgColor: "bg-success-light" },
          ]);
        } else {
          const sesiones = await sesionesService.misSesiones().catch(() => ({ data: [] as SesionDto[] }));
          const list = sesiones.data ?? [];
          const pendientes = list.filter((s) => s.estado <= 2).length;
          const completadas = list.filter((s) => s.estado >= 3).length;
          setStats([
            { label: "Pendientes", value: pendientes, icon: BookOpen, color: "text-warning", bgColor: "bg-warning-light" },
            { label: "Completadas", value: completadas, icon: ClipboardList, color: "text-success", bgColor: "bg-success-light" },
          ]);
        }
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Inicio", href: "/" }, { label: "Dashboard" }]}
        title={`Bienvenido, ${user?.nombre ?? "Usuario"}`}
        subtitle={`Panel de ${user?.rol ?? "control"} — resumen general del sistema`}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-medium text-success">
            <Activity className="h-3 w-3" /> Sistema activo
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
            <TrendingUp className="h-3 w-3" /> {stats.length} métricas
          </span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-border bg-surface-alt p-5 transition-all duration-200 hover:shadow-[var(--shadow-elevated)]"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor} transition-transform duration-200 group-hover:scale-110`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

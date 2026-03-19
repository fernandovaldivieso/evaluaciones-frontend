"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { BarChart3, TrendingUp, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { resultadosService } from "@/services/resultados.service";
import type { ResultadoDto } from "@/types";
import ProtectedRoute from "@/components/protected-route";

interface SeccionScore {
  Obtenido: number;
  Maximo: number;
  Porcentaje: number;
}

export default function ResultadoSesionPage() {
  const { sesionId } = useParams<{ sesionId: string }>();
  const [resultado, setResultado] = useState<ResultadoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [secciones, setSecciones] = useState<Record<string, SeccionScore>>({});

  const load = useCallback(async () => {
    if (!sesionId) return;
    setLoading(true);
    try {
      const res = await resultadosService.getBySesion(sesionId);
      if (res.success && res.data) {
        setResultado(res.data);
        if (res.data.scorePorSeccion) {
          try { setSecciones(JSON.parse(res.data.scorePorSeccion)); } catch { /* ignore */ }
        }
      } else {
        // No result yet — may need analysis
        setResultado(null);
      }
    } catch {
      setResultado(null);
    } finally {
      setLoading(false);
    }
  }, [sesionId]);

  useEffect(() => { load(); }, [load]);

  const handleAnalizar = async () => {
    if (!sesionId) return;
    setAnalyzing(true);
    try {
      const res = await resultadosService.analizar(sesionId);
      if (res.success) { toast.success("Análisis completado"); load(); }
      else toast.error(res.message || "Error al analizar");
    } catch { toast.error("Error al analizar"); } finally { setAnalyzing(false); }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!resultado) {
    return (
      <ProtectedRoute allowedRoles={["Admin", "Evaluador"]}>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay resultado para esta sesión aún.</p>
          <button onClick={handleAnalizar} disabled={analyzing} className="flex items-center gap-2 mx-auto rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analizar sesión
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const fortalezas = resultado.fortalezasIdentificadas?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const brechas = resultado.brechasIdentificadas?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  return (
    <ProtectedRoute allowedRoles={["Admin", "Evaluador"]}>
      <div>
        <PageHeader
          breadcrumbs={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Resultados" },
            { label: resultado.evaluacionNombre },
          ]}
          title={`Resultado: ${resultado.evaluacionNombre}`}
          subtitle={`Candidato: ${resultado.candidatoNombre}`}
          backHref="/ranking"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Score total */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] text-center">
            <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-primary-light">
              <span className="text-3xl font-bold text-primary">{resultado.scoreTotal.toFixed(1)}%</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Score Total</p>
            <p className="text-xs text-gray-500 mt-1">Análisis: {new Date(resultado.fechaAnalisis).toLocaleDateString("es-ES")}</p>
          </div>

          {/* Fortalezas */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="text-sm font-semibold text-gray-900">Fortalezas</h3>
            </div>
            {fortalezas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fortalezas.map((f) => <span key={f} className="rounded-full bg-success-light px-3 py-1 text-xs font-medium text-success">{f}</span>)}
              </div>
            ) : <p className="text-xs text-gray-400">Sin datos</p>}
          </div>

          {/* Brechas */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold text-gray-900">Brechas</h3>
            </div>
            {brechas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {brechas.map((b) => <span key={b} className="rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent">{b}</span>)}
              </div>
            ) : <p className="text-xs text-gray-400">Sin datos</p>}
          </div>
        </div>

        {/* Score por sección */}
        {Object.keys(secciones).length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">Score por Sección</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(secciones).map(([name, score]) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{name}</span>
                    <span className="text-sm font-medium text-gray-900">{score.Obtenido}/{score.Maximo} ({score.Porcentaje}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-border-light">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${score.Porcentaje}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendación IA */}
        {resultado.recomendacionIA && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary-50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-primary">Recomendación</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{resultado.recomendacionIA}</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

import Link from "next/link";
import {
  ClipboardList,
  Plus,
  MoreHorizontal,
  Clock,
  FileText,
} from "lucide-react";
import { mockEvaluations } from "@/data/mock-data";

const statusConfig = {
  active: { label: "Activa", className: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Borrador", className: "bg-amber-50 text-amber-700" },
  archived: { label: "Archivada", className: "bg-gray-100 text-gray-500" },
};

export default function EvaluationsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Evaluaciones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las evaluaciones técnicas de tu organización
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#1b4965] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#153e56]">
          <Plus className="h-4 w-4" />
          Nueva evaluación
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1b4965]/10">
              <ClipboardList className="h-5 w-5 text-[#1b4965]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {mockEvaluations.length}
              </p>
              <p className="text-sm text-gray-500">Total evaluaciones</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {mockEvaluations.filter((e) => e.status === "active").length}
              </p>
              <p className="text-sm text-gray-500">Activas</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {mockEvaluations.filter((e) => e.status === "draft").length}
              </p>
              <p className="text-sm text-gray-500">Borradores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Evaluación
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Categoría
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Duración
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Preguntas
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockEvaluations.map((evaluation) => {
                const status = statusConfig[evaluation.status];
                return (
                  <tr
                    key={evaluation.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {evaluation.title}
                        </p>
                        <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">
                          {evaluation.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {evaluation.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {evaluation.duration} min
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {evaluation.questions.length}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/evaluations/${evaluation.id}`}
                        className="inline-flex items-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

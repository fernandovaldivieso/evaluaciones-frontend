import apiClient from "@/lib/api-client";
import type { ApiResponse, ResultadoDto, RankingProcesoDto, RevisarRespuestaDto } from "@/types";

export const resultadosService = {
  async analizar(sesionId: string) {
    const res = await apiClient.post<ApiResponse<ResultadoDto>>(`/resultados/analizar/${sesionId}`);
    return res.data;
  },

  async getBySesion(sesionId: string) {
    const res = await apiClient.get<ApiResponse<ResultadoDto>>(`/resultados/sesion/${sesionId}`);
    return res.data;
  },

  async getRanking(procesoId: string) {
    const res = await apiClient.get<ApiResponse<RankingProcesoDto>>(`/resultados/ranking/${procesoId}`);
    return res.data;
  },

  async getMiResultado(sesionId: string) {
    const res = await apiClient.get<ApiResponse<ResultadoDto>>(`/resultados/mi-resultado/${sesionId}`);
    return res.data;
  },

  async revisarRespuesta(sesionId: string, respuestaId: string, data: RevisarRespuestaDto) {
    const res = await apiClient.patch<ApiResponse>(`/resultados/${sesionId}/respuestas/${respuestaId}/revisar`, data);
    return res.data;
  },
};

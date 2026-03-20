import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  EvaluacionDto,
  EvaluacionDetalleDto,
  EvaluacionParaCandidatoDto,
  CreateEvaluacionDto,
  UpdateEvaluacionDto,
  SeccionDto,
  CreateSeccionDto,
  UpdateSeccionDto,
  PreguntaDto,
  CreatePreguntaDto,
  UpdatePreguntaDto,
} from "@/types";

export const evaluacionesService = {
  async getAll() {
    const res = await apiClient.get<ApiResponse<EvaluacionDto[]>>("/evaluaciones");
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiResponse<EvaluacionDto>>(`/evaluaciones/${id}`);
    return res.data;
  },

  async getDetalle(id: string) {
    const res = await apiClient.get<ApiResponse<EvaluacionDetalleDto>>(`/evaluaciones/${id}/detalle`);
    return res.data;
  },

  async getParaCandidato(id: string) {
    const res = await apiClient.get<ApiResponse<EvaluacionParaCandidatoDto>>(`/evaluaciones/${id}/para-candidato`);
    return res.data;
  },

  async create(data: CreateEvaluacionDto) {
    const res = await apiClient.post<ApiResponse<EvaluacionDto>>("/evaluaciones", data);
    return res.data;
  },

  async update(id: string, data: UpdateEvaluacionDto) {
    const res = await apiClient.put<ApiResponse<EvaluacionDto>>(`/evaluaciones/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await apiClient.delete<ApiResponse>(`/evaluaciones/${id}`);
    return res.data;
  },

  async duplicar(id: string) {
    const res = await apiClient.post<ApiResponse<EvaluacionDto>>(`/evaluaciones/${id}/duplicar`);
    return res.data;
  },

  // Secciones
  async getSecciones(evaluacionId: string) {
    const res = await apiClient.get<ApiResponse<SeccionDto[]>>(`/evaluaciones/${evaluacionId}/secciones`);
    return res.data;
  },

  async createSeccion(evaluacionId: string, data: CreateSeccionDto) {
    const res = await apiClient.post<ApiResponse<SeccionDto>>(`/evaluaciones/${evaluacionId}/secciones`, data);
    return res.data;
  },

  async updateSeccion(seccionId: string, data: UpdateSeccionDto) {
    const res = await apiClient.put<ApiResponse<SeccionDto>>(`/evaluaciones/secciones/${seccionId}`, data);
    return res.data;
  },

  async deleteSeccion(seccionId: string) {
    const res = await apiClient.delete<ApiResponse>(`/evaluaciones/secciones/${seccionId}`);
    return res.data;
  },

  // Preguntas
  async getPreguntas(seccionId: string) {
    const res = await apiClient.get<ApiResponse<PreguntaDto[]>>(`/evaluaciones/secciones/${seccionId}/preguntas`);
    return res.data;
  },

  async createPregunta(seccionId: string, data: CreatePreguntaDto) {
    const res = await apiClient.post<ApiResponse<PreguntaDto>>(`/evaluaciones/secciones/${seccionId}/preguntas`, data);
    return res.data;
  },

  async updatePregunta(preguntaId: string, data: UpdatePreguntaDto) {
    const res = await apiClient.put<ApiResponse<PreguntaDto>>(`/evaluaciones/preguntas/${preguntaId}`, data);
    return res.data;
  },

  async deletePregunta(preguntaId: string) {
    const res = await apiClient.delete<ApiResponse>(`/evaluaciones/preguntas/${preguntaId}`);
    return res.data;
  },
};

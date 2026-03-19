import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  SesionDto,
  IniciarSesionDto,
  ResponderPreguntaDto,
  ProgresoSesionDto,
  EvaluacionDetalleDto,
} from "@/types";

export const sesionesService = {
  async iniciar(data: IniciarSesionDto) {
    const res = await apiClient.post<ApiResponse<SesionDto>>("/sesiones/iniciar", data);
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiResponse<SesionDto>>(`/sesiones/${id}`);
    return res.data;
  },

  async getProgreso(sesionId: string) {
    const res = await apiClient.get<ApiResponse<ProgresoSesionDto>>(`/sesiones/${sesionId}/progreso`);
    return res.data;
  },

  async responder(sesionId: string, data: ResponderPreguntaDto) {
    const res = await apiClient.post<ApiResponse>(`/sesiones/${sesionId}/responder`, data);
    return res.data;
  },

  async finalizar(sesionId: string) {
    const res = await apiClient.post<ApiResponse<SesionDto>>(`/sesiones/${sesionId}/finalizar`);
    return res.data;
  },

  async misSesiones() {
    const res = await apiClient.get<ApiResponse<SesionDto[]>>("/sesiones/mis-sesiones");
    return res.data;
  },

  async getSesionesCandidato(candidatoId: string) {
    const res = await apiClient.get<ApiResponse<SesionDto[]>>(`/sesiones/candidato/${candidatoId}`);
    return res.data;
  },

  async getEvaluacionDetalle(evaluacionId: string) {
    const res = await apiClient.get<ApiResponse<EvaluacionDetalleDto>>(`/evaluaciones/${evaluacionId}/detalle`);
    return res.data;
  },
};

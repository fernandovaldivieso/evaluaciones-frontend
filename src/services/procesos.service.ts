import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  ProcesoDto,
  ProcesoDetalleDto,
  CreateProcesoDto,
  UpdateProcesoDto,
  AsignarCandidatosDto,
  AsignarEvaluacionesDto,
} from "@/types";

export const procesosService = {
  async getAll() {
    const res = await apiClient.get<ApiResponse<ProcesoDto[]>>("/procesos");
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiResponse<ProcesoDetalleDto>>(`/procesos/${id}`);
    return res.data;
  },

  async create(data: CreateProcesoDto) {
    const res = await apiClient.post<ApiResponse<ProcesoDto>>("/procesos", data);
    return res.data;
  },

  async update(id: string, data: UpdateProcesoDto) {
    const res = await apiClient.put<ApiResponse<ProcesoDto>>(`/procesos/${id}`, data);
    return res.data;
  },

  async asignarCandidatos(procesoId: string, data: AsignarCandidatosDto) {
    const res = await apiClient.post<ApiResponse>(`/procesos/${procesoId}/candidatos`, data);
    return res.data;
  },

  async asignarEvaluaciones(procesoId: string, data: AsignarEvaluacionesDto) {
    const res = await apiClient.post<ApiResponse>(`/procesos/${procesoId}/evaluaciones`, data);
    return res.data;
  },
};

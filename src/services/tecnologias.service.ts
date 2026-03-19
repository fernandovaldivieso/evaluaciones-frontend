import apiClient from "@/lib/api-client";
import type { ApiResponse, TecnologiaDto, CreateTecnologiaDto, UpdateTecnologiaDto } from "@/types";

export const tecnologiasService = {
  async getAll() {
    const res = await apiClient.get<ApiResponse<TecnologiaDto[]>>("/tecnologias");
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiResponse<TecnologiaDto>>(`/tecnologias/${id}`);
    return res.data;
  },

  async create(data: CreateTecnologiaDto) {
    const res = await apiClient.post<ApiResponse<TecnologiaDto>>("/tecnologias", data);
    return res.data;
  },

  async update(id: string, data: UpdateTecnologiaDto) {
    const res = await apiClient.put<ApiResponse<TecnologiaDto>>(`/tecnologias/${id}`, data);
    return res.data;
  },
};

import apiClient from "@/lib/api-client";
import type { ApiResponse, UsuarioDto, CreateUsuarioDto, UpdateUsuarioDto } from "@/types";

export const usuariosService = {
  async getAll() {
    const res = await apiClient.get<ApiResponse<UsuarioDto[]>>("/usuarios");
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiResponse<UsuarioDto>>(`/usuarios/${id}`);
    return res.data;
  },

  async create(data: CreateUsuarioDto) {
    const res = await apiClient.post<ApiResponse<UsuarioDto>>("/usuarios", data);
    return res.data;
  },

  async update(id: string, data: UpdateUsuarioDto) {
    const res = await apiClient.put<ApiResponse<UsuarioDto>>(`/usuarios/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await apiClient.delete<ApiResponse>(`/usuarios/${id}`);
    return res.data;
  },

  async getCandidatos() {
    const res = await apiClient.get<ApiResponse<UsuarioDto[]>>("/usuarios/candidatos");
    return res.data;
  },
};

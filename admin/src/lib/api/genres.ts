import apiClient from "./client";
import { Genre, PaginatedResponse } from "@/types";

export interface CreateGenreDto {
  name: string;
  description?: string;
  coverUrl?: string;
  color?: string;
}

export const genresApi = {
  getAll: async (): Promise<PaginatedResponse<Genre>> => {
    const response = await apiClient.get("/genres");
    return response.data;
  },

  getById: async (id: number): Promise<Genre> => {
    const response = await apiClient.get(`/genres/${id}`);
    return response.data;
  },

  create: async (data: CreateGenreDto): Promise<Genre> => {
    const response = await apiClient.post("/genres", data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateGenreDto>): Promise<Genre> => {
    const response = await apiClient.patch(`/genres/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/genres/${id}`);
  },
};

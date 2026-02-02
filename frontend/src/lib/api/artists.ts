import apiClient from "./client";
import { Artist, PaginatedResponse } from "@/types";

export interface ArtistListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const artistsApi = {
  getAll: async (
    params: ArtistListParams = {},
  ): Promise<PaginatedResponse<Artist>> => {
    const response = await apiClient.post("/artists/list", params);
    return response.data;
  },

  getById: async (id: number): Promise<Artist> => {
    const response = await apiClient.get(`/artists/${id}`);
    return response.data;
  },

  create: async (data: Partial<Artist>): Promise<Artist> => {
    const response = await apiClient.post("/artists", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Artist>): Promise<Artist> => {
    const response = await apiClient.patch(`/artists/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/artists/${id}`);
  },
};

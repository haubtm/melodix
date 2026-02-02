import apiClient from "./client";
import { Album, PaginatedResponse } from "@/types";

export interface AlbumQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  artistId?: number;
}

export const albumsApi = {
  getAll: async (
    params: AlbumQueryParams = {},
  ): Promise<PaginatedResponse<Album>> => {
    const response = await apiClient.get("/albums", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Album> => {
    const response = await apiClient.get(`/albums/${id}`);
    return response.data;
  },

  create: async (data: Partial<Album>): Promise<Album> => {
    const response = await apiClient.post("/albums", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Album>): Promise<Album> => {
    const response = await apiClient.patch(`/albums/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/albums/${id}`);
  },
};

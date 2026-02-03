import apiClient from "./client";
import { Album, PaginatedResponse, ContentStatus } from "@/types";

export interface AlbumQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  artistId?: number;
}

export interface CreateAlbumDto {
  title: string;
  artistId: number;
  albumType: "album" | "single" | "ep" | "compilation";
  coverUrl?: string;
  releaseDate?: string;
  description?: string;
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

  create: async (data: CreateAlbumDto): Promise<Album> => {
    const response = await apiClient.post("/albums", data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateAlbumDto>): Promise<Album> => {
    const response = await apiClient.patch(`/albums/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/albums/${id}`);
  },
};

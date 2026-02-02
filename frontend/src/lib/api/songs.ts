import apiClient from "./client";
import { Song, PaginatedResponse } from "@/types";

export interface SongQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  artistId?: number;
  albumId?: number;
  genreId?: number;
}

export const songsApi = {
  getAll: async (
    params: SongQueryParams = {},
  ): Promise<PaginatedResponse<Song>> => {
    const response = await apiClient.get("/songs", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Song> => {
    const response = await apiClient.get(`/songs/${id}`);
    return response.data;
  },

  create: async (data: Partial<Song>): Promise<Song> => {
    const response = await apiClient.post("/songs", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Song>): Promise<Song> => {
    const response = await apiClient.patch(`/songs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/songs/${id}`);
  },
};

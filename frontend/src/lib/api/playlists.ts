import apiClient from "./client";
import { Playlist, PaginatedResponse } from "@/types";

export interface PlaylistQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const playlistsApi = {
  getAll: async (
    params: PlaylistQueryParams = {},
  ): Promise<PaginatedResponse<Playlist>> => {
    const response = await apiClient.get("/playlists", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Playlist> => {
    const response = await apiClient.get(`/playlists/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Playlist> => {
    const response = await apiClient.post("/playlists", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Playlist>): Promise<Playlist> => {
    const response = await apiClient.patch(`/playlists/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/playlists/${id}`);
  },

  addSongs: async (
    playlistId: number,
    songIds: number[],
  ): Promise<Playlist> => {
    const response = await apiClient.post(`/playlists/${playlistId}/songs`, {
      songIds,
    });
    return response.data;
  },

  removeSong: async (playlistId: number, songId: number): Promise<void> => {
    await apiClient.delete(`/playlists/${playlistId}/songs/${songId}`);
  },
};

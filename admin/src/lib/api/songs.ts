import apiClient from "./client";
import { Song, PaginatedResponse, ContentStatus } from "@/types";

export interface SongQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  artistId?: number;
  albumId?: number;
}

export interface CreateSongDto {
  title: string;
  artistId: number;
  albumId?: number;
  genreId?: number;
  audioUrl: string;
  coverUrl?: string;
  durationMs: number;
  lyrics?: string;
  explicit?: boolean;
  trackNumber?: number;
}

export interface UpdateSongDto extends Partial<CreateSongDto> {
  status?: ContentStatus;
  rejectionReason?: string;
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

  create: async (data: CreateSongDto): Promise<Song> => {
    const response = await apiClient.post("/songs", data);
    return response.data;
  },

  update: async (id: number, data: UpdateSongDto): Promise<Song> => {
    const response = await apiClient.patch(`/songs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/songs/${id}`);
  },

  // Approval actions (UI ready, backend pending)
  approve: async (id: number): Promise<Song> => {
    const response = await apiClient.patch(`/songs/${id}`, {
      status: "published",
    });
    return response.data;
  },

  reject: async (id: number, reason: string): Promise<Song> => {
    const response = await apiClient.patch(`/songs/${id}`, {
      status: "rejected",
      rejectionReason: reason,
    });
    return response.data;
  },

  submitForReview: async (id: number): Promise<Song> => {
    const response = await apiClient.patch(`/songs/${id}`, {
      status: "pending",
    });
    return response.data;
  },
};

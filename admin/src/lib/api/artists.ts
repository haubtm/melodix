import apiClient from "./client";
import { Artist, PaginatedResponse } from "@/types";

export interface ArtistQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  verified?: boolean;
}

export interface CreateArtistDto {
  name: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  country?: string;
}

export const artistsApi = {
  getAll: async (
    params: ArtistQueryParams = {},
  ): Promise<PaginatedResponse<Artist>> => {
    const response = await apiClient.post("/artists/list", params);
    return response.data;
  },

  getById: async (id: number): Promise<Artist> => {
    const response = await apiClient.get(`/artists/${id}`);
    return response.data;
  },

  create: async (data: CreateArtistDto): Promise<Artist> => {
    const response = await apiClient.post("/artists", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreateArtistDto>,
  ): Promise<Artist> => {
    const response = await apiClient.patch(`/artists/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/artists/${id}`);
  },

  verify: async (id: number): Promise<Artist> => {
    const response = await apiClient.patch(`/artists/${id}`, {
      verified: true,
    });
    return response.data;
  },
};

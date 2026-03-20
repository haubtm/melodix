import { IPaginatedResponse, Song } from "@/dtos";
import { axiosService, API_BASE_URL } from "./axiosService";

export interface SongQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  artistId?: number;
  albumId?: number;
  genreId?: number;
}

/**
 * Get the streaming URL for a song
 * Uses backend proxy endpoint instead of direct S3 URL
 */
export function getStreamUrl(songId: number): string {
  return `${API_BASE_URL}/songs/${songId}/stream`;
}

export const songsApi = {
  getAll: async (
    params: SongQueryParams = {},
  ): Promise<IPaginatedResponse<Song>> => {
    const response = await axiosService.post("/songs/list", params);
    return response.data;
  },

  getById: async (id: number): Promise<Song> => {
    const response = await axiosService.get(`/songs/${id}`);
    return response.data;
  },
};


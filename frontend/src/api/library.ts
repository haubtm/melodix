import { IPaginatedResponse, Song } from "@/dtos";
import { axiosService } from "./axiosService";

export const libraryApi = {
  getLikedSongs: async (
    page: number = 1,
    limit: number = 50,
  ): Promise<IPaginatedResponse<Song>> => {
    const response = await axiosService.get("/library/songs", {
      params: { page, limit },
    });

    return response.data?.data || response.data;
  },

  likeSong: async (songId: number): Promise<{ liked: boolean; songId: number }> => {
    const response = await axiosService.post(`/library/songs/${songId}`);
    return response.data?.data || response.data;
  },

  unlikeSong: async (songId: number): Promise<{ liked: boolean; songId: number }> => {
    const response = await axiosService.delete(`/library/songs/${songId}`);
    return response.data?.data || response.data;
  },

  getLikedSongStatus: async (
    songId: number,
  ): Promise<{ liked: boolean; songId: number }> => {
    const response = await axiosService.get(`/library/songs/${songId}/status`);
    return response.data?.data || response.data;
  },
};


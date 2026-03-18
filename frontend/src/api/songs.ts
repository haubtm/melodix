import { IPaginatedResponse, Song } from "@/dtos";
import { axiosService } from "./axiosService";

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
  ): Promise<IPaginatedResponse<Song>> => {
    const response = await axiosService.get("/songs", { params });
    return response.data;
  },
};

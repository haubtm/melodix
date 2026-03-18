import { Playlist, IPaginatedResponse } from "@/dtos";
import { axiosService } from "./axiosService";

export interface PlaylistQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const playlistsApi = {
  getAll: async (
    params: PlaylistQueryParams = {},
  ): Promise<IPaginatedResponse<Playlist>> => {
    const response = await axiosService.get("/playlists", { params });
    return response.data;
  },
};

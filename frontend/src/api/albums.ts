import { Album, IPaginatedResponse } from "@/dtos";
import { axiosService } from "./axiosService";

export interface AlbumQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  artistId?: number;
}

export const albumsApi = {
  getAll: async (
    params: AlbumQueryParams = {},
  ): Promise<IPaginatedResponse<Album>> => {
    const response = await axiosService.get("/albums", { params });
    return response.data;
  },
};

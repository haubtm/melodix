import { Artist, IPaginatedResponse } from "@/dtos";
import { axiosService } from "./axiosService";

export interface ArtistListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const artistsApi = {
  getAll: async (
    params: ArtistListParams = {},
  ): Promise<IPaginatedResponse<Artist>> => {
    const response = await axiosService.post("/artists/list", params);
    return response.data;
  },
};

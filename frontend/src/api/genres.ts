import { Genre, IPaginatedResponse } from "@/dtos";
import { axiosService } from "./axiosService";

export interface GenreQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const genresApi = {
  getAll: async (
    params: GenreQueryParams = {},
  ): Promise<IPaginatedResponse<Genre>> => {
    const response = await axiosService.get("/genres", { params });
    return response.data;
  },
};

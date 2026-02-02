import apiClient from "./client";
import { Genre, PaginatedResponse } from "@/types";

export const genresApi = {
  getAll: async (): Promise<PaginatedResponse<Genre>> => {
    const response = await apiClient.get("/genres");
    return response.data;
  },

  getById: async (id: number): Promise<Genre> => {
    const response = await apiClient.get(`/genres/${id}`);
    return response.data;
  },
};

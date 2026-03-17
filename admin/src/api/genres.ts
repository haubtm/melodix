import apiService from "./axiosService";
import {
  IGenreByIdResponse,
  IGenreCreateRequest,
  IGenreCreateResponse,
  IGenreListRequest,
  IGenreListResponse,
  IGenreResponseData,
  IGenreSelectItem,
  IGenreSelectResponse,
  IGenreUpdateRequest,
  IGenreUpdateResponse,
} from "@/dtos/genres";

export const genreApi = {
  list: async (params: IGenreListRequest): Promise<IGenreListResponse> => {
    return apiService.postPaginated<IGenreResponseData>("/genres/list", params);
  },

  getById: async (id: number): Promise<IGenreByIdResponse> => {
    return apiService.get<IGenreResponseData>(`/genres/${id}`);
  },

  create: async (data: IGenreCreateRequest): Promise<IGenreCreateResponse> => {
    return apiService.post<IGenreResponseData>("/genres", data);
  },

  update: async (
    id: number,
    data: IGenreUpdateRequest,
  ): Promise<IGenreUpdateResponse> => {
    return apiService.patch<IGenreResponseData>(`/genres/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiService.delete(`/genres/${id}`);
  },

  deleteMany: async (ids: number[]): Promise<void> => {
    await apiService.delete("/genres/many", { data: { ids } });
  },

  getListUsingSelect: async (
    params: IGenreListRequest,
  ): Promise<IGenreSelectResponse> => {
    return apiService.postPaginated<IGenreSelectItem>(
      "/genres/list-using-select",
      params,
    );
  },
};

export default genreApi;

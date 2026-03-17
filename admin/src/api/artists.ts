import apiService from "./axiosService";
import {
  IArtistListRequest,
  IArtistListResponse,
  IArtistByIdResponse,
  IArtistCreateRequest,
  IArtistCreateResponse,
  IArtistUpdateRequest,
  IArtistUpdateResponse,
  IArtistResponseData,
  IArtistSelectItem,
  IArtistSelectResponse,
  IUserSelectItem,
  IUserSelectResponse,
} from "@/dtos/artists";
import { PaginatedRequest } from "@/dtos/common";

export const artistApi = {
  list: async (params: IArtistListRequest): Promise<IArtistListResponse> => {
    return apiService.postPaginated<IArtistResponseData>(
      "/artists/list",
      params,
    );
  },

  getById: async (id: number): Promise<IArtistByIdResponse> => {
    return apiService.get<IArtistResponseData>(`/artists/${id}`);
  },

  create: async (
    data: IArtistCreateRequest,
  ): Promise<IArtistCreateResponse> => {
    return apiService.post<IArtistResponseData>("/artists", data);
  },

  update: async (
    id: number,
    data: IArtistUpdateRequest,
  ): Promise<IArtistUpdateResponse> => {
    return apiService.patch<IArtistResponseData>(`/artists/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiService.delete(`/artists/${id}`);
  },

  deleteMany: async (ids: number[]): Promise<void> => {
    await apiService.delete("/artists/many", { data: { ids } });
  },

  getUsersForSelect: async (
    params: PaginatedRequest,
  ): Promise<IUserSelectResponse> => {
    return apiService.postPaginated<IUserSelectItem>(
      "/users/list-using-select",
      params,
    );
  },

  getListUsingSelect: async (
    params: IArtistListRequest,
  ): Promise<IArtistSelectResponse> => {
    return apiService.postPaginated<IArtistSelectItem>(
      "/artists/list-using-select",
      params,
    );
  },
};

export default artistApi;

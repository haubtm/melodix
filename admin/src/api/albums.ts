import apiService from "./axiosService";
import {
  IAlbumByIdResponse,
  IAlbumCreateRequest,
  IAlbumCreateResponse,
  IAlbumListRequest,
  IAlbumListResponse,
  IAlbumResponseData,
  IAlbumSelectItem,
  IAlbumSelectResponse,
  IAlbumUpdateRequest,
  IAlbumUpdateResponse,
} from "@/dtos/albums";

export const albumApi = {
  list: async (params: IAlbumListRequest): Promise<IAlbumListResponse> => {
    return apiService.postPaginated<IAlbumResponseData>("/albums/list", params);
  },

  getById: async (id: number): Promise<IAlbumByIdResponse> => {
    return apiService.get<IAlbumResponseData>(`/albums/${id}`);
  },

  create: async (data: IAlbumCreateRequest): Promise<IAlbumCreateResponse> => {
    return apiService.post<IAlbumResponseData>("/albums", data);
  },

  update: async (
    id: number,
    data: IAlbumUpdateRequest,
  ): Promise<IAlbumUpdateResponse> => {
    return apiService.patch<IAlbumResponseData>(`/albums/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiService.delete(`/albums/${id}`);
  },

  deleteMany: async (ids: number[]): Promise<void> => {
    await apiService.delete("/albums/many", { data: { ids } });
  },

  getListUsingSelect: async (
    params: IAlbumListRequest,
  ): Promise<IAlbumSelectResponse> => {
    return apiService.postPaginated<IAlbumSelectItem>(
      "/albums/list-using-select",
      params,
    );
  },
};

export default albumApi;

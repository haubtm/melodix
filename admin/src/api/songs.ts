import apiService from "./axiosService";
import {
  CreateSongRequest,
  ISongListResponse,
  ListSongsRequest,
  Song,
  UpdateSongRequest,
} from "@/dtos";

export const songApi = {
  list: async (params: ListSongsRequest): Promise<ISongListResponse> => {
    return apiService.postPaginated<Song>("/songs/list", params);
  },

  getById: async (id: number) => {
    return apiService.get<Song>(`/songs/${id}`);
  },

  create: async (data: CreateSongRequest) => {
    return apiService.post<Song>("/songs", data);
  },

  update: async (id: number, data: UpdateSongRequest) => {
    return apiService.patch<Song>(`/songs/${id}`, data);
  },

  delete: async (id: number) => {
    await apiService.delete(`/songs/${id}`);
  },

  approve: async (id: number) => {
    return apiService.patch<Song>(`/songs/${id}/approve`);
  },

  reject: async (id: number, rejectionReason: string) => {
    return apiService.patch<Song>(`/songs/${id}/reject`, {
      rejectionReason,
    });
  },

  getListUsingSelect: async (params: ListSongsRequest) => {
    return apiService.postPaginated<{ id: number; title: string }>(
      "/songs/list-using-select",
      params,
    );
  },
};

export default songApi;

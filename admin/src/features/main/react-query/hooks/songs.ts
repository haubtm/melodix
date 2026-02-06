import { useMutation, useQuery } from "@tanstack/react-query";
import apiService from "@/api/axiosService";
import { ListSongsRequest, UpdateSongRequest, CreateSongRequest } from "@/dtos";
import { Song } from "@/dtos";
import { songKeys } from "../query-keys";

// API functions
const songsApi = {
  list: async (params: ListSongsRequest) => {
    const response = await apiService.get<{ items: Song[]; total: number }>(
      "/songs",
      { params },
    );
    return response.data.data;
  },

  detail: async (id: number) => {
    const response = await apiService.get<Song>(`/songs/${id}`);
    return response.data.data;
  },

  create: async (data: CreateSongRequest) => {
    const response = await apiService.post<Song>("/songs", data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateSongRequest) => {
    const response = await apiService.patch<Song>(`/songs/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await apiService.delete<void>(`/songs/${id}`);
    return response.data.data;
  },

  approve: async (id: number) => {
    const response = await apiService.patch<Song>(`/songs/${id}/approve`);
    return response.data.data;
  },

  reject: async (id: number, reason: string) => {
    const response = await apiService.patch<Song>(`/songs/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },
};

// Query hooks
export const useSongsList = (params: ListSongsRequest) => {
  return useQuery({
    queryKey: songKeys.list(params),
    queryFn: () => songsApi.list(params),
  });
};

export const useSongDetail = (id: number) => {
  return useQuery({
    queryKey: songKeys.detail(id),
    queryFn: () => songsApi.detail(id),
    enabled: id > 0,
  });
};

// Mutation hooks
export const useCreateSong = () => {
  return useMutation({
    mutationFn: (data: CreateSongRequest) => songsApi.create(data),
  });
};

export const useUpdateSong = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSongRequest }) =>
      songsApi.update(id, data),
  });
};

export const useDeleteSong = () => {
  return useMutation({
    mutationFn: (id: number) => songsApi.delete(id),
  });
};

export const useApproveSong = () => {
  return useMutation({
    mutationFn: (id: number) => songsApi.approve(id),
  });
};

export const useRejectSong = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      songsApi.reject(id, reason),
  });
};

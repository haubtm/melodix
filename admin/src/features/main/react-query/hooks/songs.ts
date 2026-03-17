import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { songApi } from "@/api";
import { CreateSongRequest, ListSongsRequest, UpdateSongRequest } from "@/dtos";
import { songKeys } from "../query-keys";

export const useSongsList = (params: ListSongsRequest) => {
  return useQuery({
    queryKey: songKeys.list(params),
    queryFn: () => songApi.list(params),
  });
};

export const useSongDetail = (id: number) => {
  return useQuery({
    queryKey: songKeys.detail(id),
    queryFn: async () => {
      const response = await songApi.getById(id);
      return response.data;
    },
    enabled: id > 0,
  });
};

export const useCreateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSongRequest) => {
      const response = await songApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
    },
  });
};

export const useUpdateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSongRequest;
    }) => {
      const response = await songApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: songKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => songApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
    },
  });
};

export const useApproveSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await songApi.approve(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
    },
  });
};

export const useRejectSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const response = await songApi.reject(id, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
    },
  });
};

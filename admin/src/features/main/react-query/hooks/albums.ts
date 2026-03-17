import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { albumApi } from "@/api";
import { albumKeys } from "../query-keys";
import {
  IAlbumByIdResponse,
  IAlbumCreateRequest,
  IAlbumCreateResponse,
  IAlbumListRequest,
  IAlbumListResponse,
  IAlbumSelectResponse,
  IAlbumUpdateRequest,
  IAlbumUpdateResponse,
} from "@/dtos/albums";

export const useAlbumsList = (params: IAlbumListRequest) => {
  return useQuery<IAlbumListResponse>({
    queryKey: albumKeys.list(params),
    queryFn: () => albumApi.list(params),
  });
};

export const useAlbumDetail = (id: number) => {
  return useQuery<IAlbumByIdResponse>({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation<IAlbumCreateResponse, Error, IAlbumCreateRequest>({
    mutationFn: (data) => albumApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
    },
  });
};

export const useUpdateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IAlbumUpdateResponse,
    Error,
    { id: number; data: IAlbumUpdateRequest }
  >({
    mutationFn: ({ id, data }) => albumApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: albumKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => albumApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
    },
  });
};

export const useAlbumsForSelect = (params: IAlbumListRequest) => {
  return useQuery<IAlbumSelectResponse>({
    queryKey: albumKeys.select(params),
    queryFn: () => albumApi.getListUsingSelect(params),
  });
};

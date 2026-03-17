import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { artistApi } from "@/api";
import { artistKeys } from "../query-keys";
import {
  IArtistListRequest,
  IArtistListResponse,
  IArtistByIdResponse,
  IArtistCreateRequest,
  IArtistCreateResponse,
  IArtistSelectResponse,
  IArtistUpdateRequest,
  IArtistUpdateResponse,
  IUserSelectResponse,
} from "@/dtos/artists";
import { PaginatedRequest } from "@/dtos/common";

export const useArtistsList = (params: IArtistListRequest) => {
  return useQuery<IArtistListResponse>({
    queryKey: artistKeys.list(params),
    queryFn: () => artistApi.list(params),
  });
};

export const useArtistDetail = (id: number) => {
  return useQuery<IArtistByIdResponse>({
    queryKey: artistKeys.detail(id),
    queryFn: () => artistApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateArtist = () => {
  const queryClient = useQueryClient();

  return useMutation<IArtistCreateResponse, Error, IArtistCreateRequest>({
    mutationFn: (data) => artistApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() });
    },
  });
};

export const useUpdateArtist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IArtistUpdateResponse,
    Error,
    { id: number; data: IArtistUpdateRequest }
  >({
    mutationFn: ({ id, data }) => artistApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: artistKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteArtist = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => artistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() });
    },
  });
};

export const useUsersForSelect = (params: PaginatedRequest) => {
  return useQuery<IUserSelectResponse>({
    queryKey: artistKeys.userSelect(params),
    queryFn: () => artistApi.getUsersForSelect(params),
  });
};

export const useArtistsForSelect = (params: IArtistListRequest) => {
  return useQuery<IArtistSelectResponse>({
    queryKey: artistKeys.artistSelect(params),
    queryFn: () => artistApi.getListUsingSelect(params),
  });
};

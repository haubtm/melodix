import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { genreApi, uploadApi } from "@/api";
import { genreKeys } from "../query-keys";
import {
  IGenreByIdResponse,
  IGenreCreateRequest,
  IGenreCreateResponse,
  IGenreListRequest,
  IGenreListResponse,
  IGenreSelectResponse,
  IGenreUpdateRequest,
  IGenreUpdateResponse,
} from "@/dtos/genres";
import { UploadResponse } from "@/dtos/common";

export const useGenresList = (params: IGenreListRequest) => {
  return useQuery<IGenreListResponse>({
    queryKey: genreKeys.list(params),
    queryFn: () => genreApi.list(params),
  });
};

export const useGenreDetail = (id: number) => {
  return useQuery<IGenreByIdResponse>({
    queryKey: genreKeys.detail(id),
    queryFn: () => genreApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateGenre = () => {
  const queryClient = useQueryClient();

  return useMutation<IGenreCreateResponse, Error, IGenreCreateRequest>({
    mutationFn: (data) => genreApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
    },
  });
};

export const useUpdateGenre = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IGenreUpdateResponse,
    Error,
    { id: number; data: IGenreUpdateRequest }
  >({
    mutationFn: ({ id, data }) => genreApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: genreKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteGenre = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => genreApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
    },
  });
};

export const useGenresForSelect = (params: IGenreListRequest) => {
  return useQuery<IGenreSelectResponse>({
    queryKey: genreKeys.select(params),
    queryFn: () => genreApi.getListUsingSelect(params),
  });
};

export const useUploadGenreImage = () => {
  return useMutation<UploadResponse, Error, { file: File; folder?: string }>({
    mutationFn: ({ file, folder }) => uploadApi.uploadFile(file, folder),
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, uploadApi } from "@/api";
import { userKeys } from "../query-keys";
import {
  IUserListRequest,
  IUserListResponse,
  IUserByIdResponse,
  IUserCreateRequest,
  IUserCreateResponse,
  IUserUpdateRequest,
  IUserUpdateResponse,
} from "@/dtos/users";
import { UploadResponse } from "@/dtos/common";

export const useUsersList = (params: IUserListRequest) => {
  return useQuery<IUserListResponse>({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.list(params),
  });
};

export const useUserDetail = (id: number) => {
  return useQuery<IUserByIdResponse>({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<IUserCreateResponse, Error, IUserCreateRequest>({
    mutationFn: (data) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IUserUpdateResponse,
    Error,
    { id: number; data: IUserUpdateRequest }
  >({
    mutationFn: ({ id, data }) => userApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUploadFile = () => {
  return useMutation<UploadResponse, Error, { file: File; folder?: string }>({
    mutationFn: ({ file, folder }) => uploadApi.uploadFile(file, folder),
  });
};

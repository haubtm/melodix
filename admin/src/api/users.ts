import apiService from "./axiosService";
import {
  IUserListRequest,
  IUserListResponse,
  IUserByIdResponse,
  IUserCreateRequest,
  IUserCreateResponse,
  IUserUpdateRequest,
  IUserUpdateResponse,
  IUserResponseData,
} from "@/dtos/users";

export const userApi = {
  list: async (params: IUserListRequest): Promise<IUserListResponse> => {
    return apiService.postPaginated<IUserResponseData>("/users/list", params);
  },

  getById: async (id: number): Promise<IUserByIdResponse> => {
    return apiService.get<IUserResponseData>(`/users/${id}`);
  },

  create: async (data: IUserCreateRequest): Promise<IUserCreateResponse> => {
    return apiService.post<IUserResponseData>("/users", data);
  },

  update: async (
    id: number,
    data: IUserUpdateRequest,
  ): Promise<IUserUpdateResponse> => {
    return apiService.patch<IUserResponseData>(`/users/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiService.delete(`/users/${id}`);
  },

  deleteMany: async (ids: number[]): Promise<void> => {
    await apiService.delete("/users/many", { data: { ids } });
  },
};

export default userApi;

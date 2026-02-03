import apiClient from "./client";
import { User, PaginatedResponse, UserRole } from "@/types";

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const usersApi = {
  getAll: async (
    params: UserQueryParams = {},
  ): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get("/users", { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  updateRole: async (id: number, role: UserRole): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, { role });
    return response.data;
  },

  ban: async (id: number): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, { isActive: false });
    return response.data;
  },

  unban: async (id: number): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, { isActive: true });
    return response.data;
  },
};

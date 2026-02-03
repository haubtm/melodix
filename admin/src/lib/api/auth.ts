import apiClient from "./client";
import { User } from "@/types";

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

// Backend response wrapper
interface ApiResponse<T> {
  code: number;
  status: number;
  message: string;
  data: T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      "/auth/login",
      data,
    );
    return response.data.data; // Extract data from wrapper
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

import apiService from "./axiosService";
import { LoginRequest, AuthTokens } from "@/dtos";
import { User } from "@/dtos";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const response = await apiService.post<AuthTokens>("/auth/login", data);
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiService.get<User>("/auth/me");
    return response.data.data;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },
};

export default authApi;

import apiService from "./axiosService";
import { LoginRequest, AuthTokens } from "@/dtos";
import { IUserResponseData } from "@/dtos/users";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const response = await apiService.post<AuthTokens>("/auth/login", data);
    return response.data;
  },

  getProfile: async (): Promise<IUserResponseData> => {
    const response = await apiService.get<IUserResponseData>("/auth/me");
    return response.data;
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

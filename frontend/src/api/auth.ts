import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from "@/dtos";
import { axiosService } from "./axiosService";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosService.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosService.post("/auth/register", data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<AuthResponse> => {
    const response = await axiosService.post("/auth/verify-email", data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosService.post("/auth/refresh", { refreshToken });
    return response.data;
  },
};

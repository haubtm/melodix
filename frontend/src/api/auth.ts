import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  VerifyEmailRequest,
} from "@/dtos";
import { axiosService } from "./axiosService";

const normalizeAuthResponse = (
  payload: AuthResponse | { data: AuthResponse },
): AuthResponse => {
  return "data" in payload ? payload.data : payload;
};

const normalizeProfileResponse = (
  payload: (User & { accessToken: string; refreshToken: string }) | { data: User & { accessToken: string; refreshToken: string } },
): User & { accessToken: string; refreshToken: string } => {
  return "data" in payload ? payload.data : payload;
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosService.post("/auth/login", data);
    return normalizeAuthResponse(response.data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosService.post("/auth/register", data);
    return normalizeAuthResponse(response.data);
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<AuthResponse> => {
    const response = await axiosService.post("/auth/verify-email", data);
    return normalizeAuthResponse(response.data);
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosService.post("/auth/refresh", { refreshToken });
    return normalizeAuthResponse(response.data);
  },

  getProfile: async (): Promise<User & { accessToken: string; refreshToken: string }> => {
    const response = await axiosService.get("/auth/me");
    return normalizeProfileResponse(response.data);
  },
};

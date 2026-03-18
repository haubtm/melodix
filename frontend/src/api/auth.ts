import {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  User,
  VerifyEmailRequest,
} from "@/dtos";
import { axiosService } from "./axiosService";

const normalizeTokenResponse = (
  payload: AuthTokens | { data: AuthTokens },
): AuthTokens => {
  return "data" in payload ? payload.data : payload;
};

const normalizeAuthResponse = (
  payload: AuthResponse | { data: AuthResponse },
): AuthResponse => {
  return "data" in payload ? payload.data : payload;
};

const normalizeProfileResponse = (
  payload:
    | (User & { accessToken: string; refreshToken: string })
    | { data: User & { accessToken: string; refreshToken: string } },
): User & { accessToken: string; refreshToken: string } => {
  return "data" in payload ? payload.data : payload;
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const response = await axiosService.post("/auth/login", data);
    return normalizeTokenResponse(response.data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosService.post("/auth/register", data);
    return normalizeAuthResponse(response.data);
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<AuthTokens> => {
    const response = await axiosService.post("/auth/verify-email", data);
    return normalizeTokenResponse(response.data);
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await axiosService.post("/auth/refresh", { refreshToken });
    return normalizeTokenResponse(response.data);
  },

  getProfile: async (
    accessToken?: string,
  ): Promise<User & { accessToken: string; refreshToken: string }> => {
    const response = await axiosService.get("/auth/me", {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });

    return normalizeProfileResponse(response.data);
  },
};

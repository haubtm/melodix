import apiClient from "./client";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  VerifyEmailRequest,
} from "@/types";

export const authApi = {
  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/verify-email", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  verifyForgotPassword: async (
    data: VerifyEmailRequest,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/verify-forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: {
    email: string;
    otpCode: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/change-password", data);
    return response.data;
  },
};

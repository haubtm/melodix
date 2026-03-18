import { User } from "../users";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface VerifyEmailRequest {
  email: string;
  otpCode: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

import { User } from "../users";

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
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

export interface AuthResponse extends AuthTokens {
  user?: User;
}

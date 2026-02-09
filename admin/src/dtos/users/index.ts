import { IResponse, IPaginatedResponse } from "@/api/axiosService";

// ============ User Response Data ============
export interface IUserResponseData {
  id: number;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  country: string | null;
  subscriptionType: "free" | "premium" | "family";
  role: "user" | "artist" | "admin";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ List Users ============
export interface IUserListRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: "user" | "artist" | "admin";
  subscriptionType?: "free" | "premium" | "family";
  isActive?: boolean;
}

export type IUserListResponse = IPaginatedResponse<IUserResponseData>;

// ============ Get User By ID ============
export interface IUserByIdRequest {
  id: number;
}

export type IUserByIdResponse = IResponse<IUserResponseData>;

// ============ Create User ============
export interface IUserCreateRequest {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  dateOfBirth?: string;
  role?: "user" | "artist" | "admin";
  country?: string;
}

export type IUserCreateResponse = IResponse<IUserResponseData>;

// ============ Update User ============
export interface IUserUpdateRequest {
  displayName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  country?: string;
}

export type IUserUpdateResponse = IResponse<IUserResponseData>;

// ============ Delete User ============
export interface IUserDeleteRequest {
  id: number;
}

export type IUserDeleteResponse = IResponse<null>;

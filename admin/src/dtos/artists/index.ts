import { IResponse, IPaginatedResponse } from "@/api/axiosService";
import { PaginatedRequest } from "@/dtos/common";

// ============ Artist Entity (backward compat) ============
export interface Artist {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  country?: string;
  verified: boolean;
  monthlyListeners: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

// ============ Artist Response Data ============
export interface IArtistResponseData {
  id: number;
  userId: number | null;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  monthlyListeners: number;
  createdAt: string;
  updatedAt: string;
}

// ============ List Artists ============
export interface IArtistListRequest extends PaginatedRequest {
  verified?: boolean;
}

export type IArtistListResponse = IPaginatedResponse<IArtistResponseData>;

// ============ Get Artist By ID ============
export interface IArtistByIdRequest {
  id: number;
}

export type IArtistByIdResponse = IResponse<IArtistResponseData>;

// ============ Create Artist ============
export interface IArtistCreateRequest {
  userId: number;
  name: string;
  slug?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export type IArtistCreateResponse = IResponse<IArtistResponseData>;

// ============ Update Artist ============
export interface IArtistUpdateRequest {
  userId?: number;
  name?: string;
  slug?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  verified?: boolean;
}

export type IArtistUpdateResponse = IResponse<IArtistResponseData>;

// ============ Delete Artist ============
export interface IArtistDeleteRequest {
  id: number;
}

export type IArtistDeleteResponse = IResponse<null>;

// ============ User Select (for dropdown) ============
export interface IUserSelectItem {
  id: number;
  username: string;
  displayName: string | null;
}

export type IUserSelectResponse = IPaginatedResponse<IUserSelectItem>;

export interface IArtistSelectItem {
  id: number;
  name: string;
}

export type IArtistSelectResponse = IPaginatedResponse<IArtistSelectItem>;

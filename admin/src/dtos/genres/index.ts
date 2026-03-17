import { IResponse, IPaginatedResponse } from "@/api/axiosService";
import { PaginatedRequest } from "@/dtos/common";

export interface Genre {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  color: string | null;
  createdAt: string;
}

export type IGenreResponseData = Genre;

export type IGenreListRequest = PaginatedRequest;

export type IGenreListResponse = IPaginatedResponse<IGenreResponseData>;

export interface IGenreByIdRequest {
  id: number;
}

export type IGenreByIdResponse = IResponse<IGenreResponseData>;

export interface IGenreCreateRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
}

export type IGenreCreateResponse = IResponse<IGenreResponseData>;

export interface IGenreUpdateRequest {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
}

export type IGenreUpdateResponse = IResponse<IGenreResponseData>;

export interface IGenreDeleteRequest {
  id: number;
}

export type IGenreDeleteResponse = IResponse<null>;

export interface IGenreSelectItem {
  id: number;
  name: string;
}

export type IGenreSelectResponse = IPaginatedResponse<IGenreSelectItem>;

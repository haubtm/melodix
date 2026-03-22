import { IResponse, IPaginatedResponse } from "@/api/axiosService";
import { PaginatedRequest } from "@/dtos/common";
import { IArtistSelectItem } from "@/dtos/artists";
import type { Song } from "@/dtos/songs";

export type AlbumType = "album" | "single" | "ep" | "compilation";

export interface IAlbumResponseData {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  releaseDate: string | null;
  albumType: AlbumType;
  totalTracks: number;
  durationMs: number;
  isPublished: boolean;
  artistId: number;
  createdAt: string;
  updatedAt: string;
  artist?: IArtistSelectItem;
  songs?: Song[];
}

export type Album = IAlbumResponseData;

export interface IAlbumListRequest extends PaginatedRequest {
  isPublished?: boolean;
  artistId?: number;
}

export type IAlbumListResponse = IPaginatedResponse<IAlbumResponseData>;

export interface IAlbumByIdRequest {
  id: number;
}

export type IAlbumByIdResponse = IResponse<IAlbumResponseData>;

export interface IAlbumCreateRequest {
  artistId: number;
  title: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  releaseDate?: string;
  albumType?: AlbumType;
  isPublished?: boolean;
}

export type IAlbumCreateResponse = IResponse<IAlbumResponseData>;

export interface IAlbumUpdateRequest {
  artistId?: number;
  title?: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  releaseDate?: string;
  albumType?: AlbumType;
  isPublished?: boolean;
}

export type IAlbumUpdateResponse = IResponse<IAlbumResponseData>;

export interface IAlbumSelectItem {
  id: number;
  title: string;
}

export type IAlbumSelectResponse = IPaginatedResponse<IAlbumSelectItem>;

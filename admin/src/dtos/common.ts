import { IResponse, IPaginatedResponse } from "@/api/axiosService";

// Re-export from axiosService
export type { IResponse, IPaginatedResponse };

// Alias for backward compatibility
export type PaginatedResponse<T> = IPaginatedResponse<T>;

export interface SearchQuery {
  fields: string[];
  data: string;
}

export interface SortQuery {
  field: string;
  order: "ASC" | "DESC" | "asc" | "desc";
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: SearchQuery;
  sorts?: SortQuery[];
}

export interface UploadResponse {
  url: string;
  filename: string;
}

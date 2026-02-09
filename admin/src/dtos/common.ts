import { IResponse, IPaginatedResponse } from "@/api/axiosService";

// Re-export from axiosService
export type { IResponse, IPaginatedResponse };

// Alias for backward compatibility
export type PaginatedResponse<T> = IPaginatedResponse<T>;

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UploadResponse {
  url: string;
  filename: string;
}

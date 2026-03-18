export interface IPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface IPaginatedResponse<T> {
  data: T[];
  metadata?: IPaginationMetadata;
  meta?: IPaginationMetadata;
}

export interface IApiError {
  statusCode: number;
  message: string;
  error?: string;
}

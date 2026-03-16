"use client";

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

// Response wrapper cho single item
export interface IResponse<T = unknown> {
  code: number;
  status: number;
  message: string;
  data: T;
}

// Response wrapper cho paginated list
export interface IPaginatedResponse<T = unknown> {
  code: number;
  status: number;
  message: string;
  data: T[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

import { STORAGE_KEY } from "@/common/constants";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);
};

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY.REFRESH_TOKEN);
};

const clearStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEY.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEY.USER);
};

const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

export const errorResponseInterceptor = async (
  error: AxiosError<IResponse>,
) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  if (error.response?.data) {
    const currentPath = window.location.pathname;

    // Handle 401 Unauthorized
    if (error.response.status === 401 && currentPath !== "/login") {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) throw new Error("No refresh token");

          // Explicitly call axios to avoid interceptor loops
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/auth/refresh`,
            { refreshToken },
          );

          if (response.data?.data) {
            const { accessToken, refreshToken: newRefresh } =
              response.data.data;

            // Update storage
            localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, accessToken);
            if (newRefresh) {
              localStorage.setItem(STORAGE_KEY.REFRESH_TOKEN, newRefresh);
            }

            // Update failed request header and retry
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest).then((res) => res.data); // Return the un-wrapped promise
          }
        } catch {
          clearStorage();
          window.location.href = "/login";
          return Promise.reject(error.response.data);
        }
      } else {
        // Fallback if retry also fails
        clearStorage();
        window.location.href = "/login";
      }
    }

    if (error.response.status === 403) {
      return Promise.reject(error.response.data);
    }

    const message = error.response?.data?.message;

    if (!message) {
      error.response.data.message = "Unknown server error";
    }

    return Promise.reject(error.response.data);
  }

  return Promise.reject(error);
};

class ApiService {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.instance.interceptors.request.use(requestInterceptor);
    this.instance.interceptors.response.use(
      (response) => response.data,
      errorResponseInterceptor,
    );
  }

  // Single item responses
  get<T>(url: string, config?: object): Promise<IResponse<T>> {
    return this.instance.get(url, config);
  }

  post<T>(url: string, data?: object, config?: object): Promise<IResponse<T>> {
    return this.instance.post(url, data, config);
  }

  put<T>(url: string, data?: object, config?: object): Promise<IResponse<T>> {
    return this.instance.put(url, data, config);
  }

  patch<T>(url: string, data?: object, config?: object): Promise<IResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  delete<T>(url: string, config?: object): Promise<IResponse<T>> {
    return this.instance.delete(url, config);
  }

  // Paginated list responses
  postPaginated<T>(
    url: string,
    data?: object,
    config?: object,
  ): Promise<IPaginatedResponse<T>> {
    return this.instance.post(url, data, config);
  }
}

export const apiService = new ApiService(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
);

export default apiService;

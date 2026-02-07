"use client";

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

export interface IResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}

import { STORAGE_KEY } from "@/common/constants";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);
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
  if (error.response?.data) {
    const currentPath = window.location.pathname;
    if (error.response.status === 401 && currentPath !== "/login") {
      window.location.href = "/login";
      clearStorage();
      return Promise.reject(error.response.data);
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
      (response) => response,
      errorResponseInterceptor,
    );
  }

  get<T>(url: string, config?: object) {
    return this.instance.get<IResponse<T>>(url, config);
  }

  post<T>(url: string, data?: object, config?: object) {
    return this.instance.post<IResponse<T>>(url, data, config);
  }

  put<T>(url: string, data?: object, config?: object) {
    return this.instance.put<IResponse<T>>(url, data, config);
  }

  patch<T>(url: string, data?: object, config?: object) {
    return this.instance.patch<IResponse<T>>(url, data, config);
  }

  delete<T>(url: string, config?: object) {
    return this.instance.delete<IResponse<T>>(url, config);
  }
}

export const apiService = new ApiService(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
);

export default apiService;

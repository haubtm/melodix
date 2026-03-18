import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const axiosService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  user: "authUser",
} as const;

const getStoredAccessToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
    : null;

const getStoredRefreshToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)
    : null;

const clearStoredAuth = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
};

axiosService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosService.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/register") &&
      !originalRequest?.url?.includes("/auth/verify-email") &&
      !originalRequest?.url?.includes("/auth/refresh") &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getStoredRefreshToken();

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const refreshPayload = response.data?.data || response.data;
          const accessToken = refreshPayload?.accessToken;
          const nextRefreshToken =
            refreshPayload?.refreshToken || refreshToken;

          if (!accessToken) {
            throw new Error("Missing refreshed access token");
          }

          localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
          localStorage.setItem(
            AUTH_STORAGE_KEYS.refreshToken,
            nextRefreshToken,
          );

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return axiosService(originalRequest);
        }
      } catch {
        clearStoredAuth();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserResponseData } from "@/dtos/users";
import { STORAGE_KEY } from "@/common/constants";

export type UserRole = "user" | "artist" | "admin";

interface AuthState {
  user: IUserResponseData | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: IUserResponseData;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEY.ACCESS_TOKEN,
          action.payload.accessToken,
        );
        localStorage.setItem(
          STORAGE_KEY.REFRESH_TOKEN,
          action.payload.refreshToken,
        );
        localStorage.setItem(
          STORAGE_KEY.USER,
          JSON.stringify(action.payload.user),
        );
      }
    },
    setUser: (state, action: PayloadAction<IUserResponseData>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEY.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEY.USER);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);
        const userStr = localStorage.getItem(STORAGE_KEY.USER);

        if (accessToken) {
          state.accessToken = accessToken;
          state.isAuthenticated = true;
          if (userStr) {
            try {
              state.user = JSON.parse(userStr);
            } catch (e) {
              console.error("Failed to parse user from local storage", e);
            }
          }
        }
      }
      state.isLoading = false;
    },
  },
});

// Permission helpers
export const hasRole = (
  user: IUserResponseData | null,
  roles: UserRole[],
): boolean => {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
};

export const isAdmin = (user: IUserResponseData | null): boolean =>
  hasRole(user, ["admin"]);
export const isArtist = (user: IUserResponseData | null): boolean =>
  hasRole(user, ["artist", "admin"]);
export const canManageUsers = (user: IUserResponseData | null): boolean =>
  isAdmin(user);
export const canApproveContent = (user: IUserResponseData | null): boolean =>
  isAdmin(user);
export const canManageArtists = (user: IUserResponseData | null): boolean =>
  isAdmin(user);

export const { setCredentials, setUser, logout, setLoading, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserResponseData } from "@/dtos/users";

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
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
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
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          state.accessToken = accessToken;
          state.isAuthenticated = true;
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

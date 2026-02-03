import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
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
        user: User;
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
    setUser: (state, action: PayloadAction<User>) => {
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
export const hasRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const isAdmin = (user: User | null): boolean => hasRole(user, ["admin"]);
export const isArtist = (user: User | null): boolean =>
  hasRole(user, ["artist", "admin"]);
export const canManageUsers = (user: User | null): boolean => isAdmin(user);
export const canApproveContent = (user: User | null): boolean => isAdmin(user);
export const canManageArtists = (user: User | null): boolean => isAdmin(user);

export const { setCredentials, setUser, logout, setLoading, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;

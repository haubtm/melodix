import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

const AUTH_STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  user: "authUser",
} as const;

const persistAuthState = (payload: {
  user: User;
  accessToken: string;
  refreshToken: string;
}) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, payload.accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, payload.refreshToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(payload.user));
};

const clearPersistedAuthState = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
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
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      persistAuthState(action.payload);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;

      if (typeof window !== "undefined") {
        localStorage.setItem(
          AUTH_STORAGE_KEYS.user,
          JSON.stringify(action.payload),
        );
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      clearPersistedAuthState();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
        const refreshToken = localStorage.getItem(
          AUTH_STORAGE_KEYS.refreshToken,
        );
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);

        if (accessToken && refreshToken) {
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;

          if (storedUser) {
            try {
              state.user = JSON.parse(storedUser) as User;
            } catch {
              localStorage.removeItem(AUTH_STORAGE_KEYS.user);
            }
          }
        } else {
          clearPersistedAuthState();
        }
      }
    },
    finishAuthInitialization: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  setCredentials,
  setUser,
  logout,
  setLoading,
  initializeAuth,
  finishAuthInitialization,
} = authSlice.actions;
export default authSlice.reducer;

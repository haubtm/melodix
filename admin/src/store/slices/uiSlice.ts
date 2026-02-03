import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

interface UIState {
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  currentModal: string | null;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: "dark",
  currentModal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.theme);
      }
    },
    initializeTheme: (state) => {
      if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
        if (savedTheme) {
          state.theme = savedTheme;
        }
      }
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.currentModal = action.payload;
    },
    closeModal: (state) => {
      state.currentModal = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  toggleTheme,
  initializeTheme,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarCollapsed: boolean;
  currentModal: string | null;
  theme: "dark" | "light";
}

const initialState: UIState = {
  sidebarCollapsed: false,
  currentModal: null,
  theme: "dark",
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
    openModal: (state, action: PayloadAction<string>) => {
      state.currentModal = action.payload;
    },
    closeModal: (state) => {
      state.currentModal = null;
    },
    setTheme: (state, action: PayloadAction<"dark" | "light">) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  openModal,
  closeModal,
  setTheme,
  toggleTheme,
} = uiSlice.actions;

export default uiSlice.reducer;

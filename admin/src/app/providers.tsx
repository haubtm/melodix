"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme, App } from "antd";
import viVN from "antd/locale/vi_VN";
import { store } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";
import { initializeTheme } from "@/store/slices/uiSlice";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Theme tokens
const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#1890ff",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f5f5f5",
    colorBgElevated: "#ffffff",
    borderRadius: 8,
  },
};

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1890ff",
    colorBgContainer: "#1f1f1f",
    colorBgLayout: "#141414",
    colorBgElevated: "#1f1f1f",
    borderRadius: 8,
  },
  components: {
    Menu: {
      colorBgContainer: "transparent",
      itemSelectedBg: "rgba(24, 144, 255, 0.15)",
    },
    Layout: {
      siderBg: "#001529",
      headerBg: "#001529",
    },
  },
};

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useAppSelector((state) => state.ui.theme);
  const currentTheme = themeMode === "dark" ? darkTheme : lightTheme;

  return (
    <ConfigProvider theme={currentTheme} locale={viVN}>
      <App>{children}</App>
    </ConfigProvider>
  );
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
    store.dispatch(initializeTheme());
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

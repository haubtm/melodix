"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme } from "antd";
import { store } from "@/store";
import { initializeAuth } from "@/store/slices/authSlice";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Ant Design dark theme customization
const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1DB954", // Spotify green
    colorBgContainer: "#181818",
    colorBgElevated: "#282828",
    colorBgLayout: "#121212",
    colorBgBase: "#121212",
    colorText: "#FFFFFF",
    colorTextSecondary: "#B3B3B3",
    colorBorder: "#404040",
    borderRadius: 8,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: "#1DB954",
      colorPrimaryHover: "#1ED760",
      borderRadius: 500, // Pill-shaped buttons
    },
    Input: {
      colorBgContainer: "#282828",
      colorBorder: "#404040",
      borderRadius: 8,
    },
    Card: {
      colorBgContainer: "#181818",
      borderRadius: 8,
    },
    Menu: {
      colorBgContainer: "transparent",
      itemSelectedBg: "rgba(255, 255, 255, 0.1)",
    },
  },
};

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={antdTheme}>
          <AuthInitializer>{children}</AuthInitializer>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
}

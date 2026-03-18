"use client";

import { ConfigProvider, theme } from "antd";
import { ReactNode } from "react";
import AntdStyleRegistry from "./AntdStyleRegistry";

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1DB954",
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
      borderRadius: 500,
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

const AntdProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AntdStyleRegistry>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </AntdStyleRegistry>
  );
};

export default AntdProvider;

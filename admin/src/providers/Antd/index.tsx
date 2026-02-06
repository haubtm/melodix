"use client";

import { ReactNode } from "react";
import { ConfigProvider, theme, App } from "antd";
import viVN from "antd/locale/vi_VN";
import { useAppSelector } from "@/store/hooks";

interface IAntdProviderProps {
  children: ReactNode;
}

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

const AntdProvider = ({ children }: IAntdProviderProps) => {
  const themeMode = useAppSelector((state) => state.ui.theme);
  const currentTheme = themeMode === "dark" ? darkTheme : lightTheme;

  return (
    <ConfigProvider theme={currentTheme} locale={viVN}>
      <App>{children}</App>
    </ConfigProvider>
  );
};

export default AntdProvider;

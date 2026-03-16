"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Layout,
  Button,
  Dropdown,
  Avatar,
  Switch,
  theme,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";
import styles from "./Header.module.css";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { token } = theme.useToken();

  const themeMode = useAppSelector((state) => state.ui.theme);
  const user = useAppSelector((state) => state.auth.user);

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard/songs")) return "Quản lý Bài hát";
    if (pathname.startsWith("/dashboard/albums")) return "Quản lý Albums";
    if (pathname.startsWith("/dashboard/artists")) return "Quản lý Nghệ sĩ";
    if (pathname.startsWith("/dashboard/genres")) return "Quản lý Thể loại";
    if (pathname.startsWith("/dashboard/approvals")) return "Duyệt bài";
    if (pathname.startsWith("/dashboard/users")) return "Quản lý Người dùng";
    if (pathname.startsWith("/dashboard/settings")) return "Cài đặt";
    return "Dashboard";
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
      onClick: () => router.push("/dashboard/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntHeader
      className={styles.header}
      style={{ background: token.colorBgContainer }}
    >
      {/* Page Title */}
      <div
        style={{ marginLeft: "16px", display: "flex", alignItems: "center" }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {getPageTitle()}
        </Title>
      </div>

      {/* Right section */}
      <div className={styles.right}>
        {/* Theme toggle */}
        <div className={styles.themeToggle}>
          <SunOutlined
            style={{
              color: themeMode === "light" ? token.colorPrimary : undefined,
            }}
          />
          <Switch
            checked={themeMode === "dark"}
            onChange={() => dispatch(toggleTheme())}
            size="small"
          />
          <MoonOutlined
            style={{
              color: themeMode === "dark" ? token.colorPrimary : undefined,
            }}
          />
        </div>

        {/* Notifications */}
        <Button
          type="text"
          icon={<BellOutlined />}
          className={styles.iconButton}
        />

        {/* User dropdown */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div className={styles.userButton}>
            <Avatar
              src={user?.avatarUrl}
              icon={!user?.avatarUrl && <UserOutlined />}
              size="small"
            />
            <span className={styles.userName}>
              {user?.displayName || user?.username || "Admin"}
            </span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
}

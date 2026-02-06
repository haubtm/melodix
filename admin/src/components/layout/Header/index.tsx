"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Layout, Button, Dropdown, Avatar, Switch, theme } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleSidebar, toggleTheme } from "@/store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";
import styles from "./Header.module.css";

const { Header: AntHeader } = Layout;

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = theme.useToken();

  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const themeMode = useAppSelector((state) => state.ui.theme);
  const user = useAppSelector((state) => state.auth.user);

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
      {/* Toggle sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => dispatch(toggleSidebar())}
        className={styles.trigger}
      />

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

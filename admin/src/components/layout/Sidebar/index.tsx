"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Typography, Button, theme } from "antd";
import type { MenuProps } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  DashboardOutlined,
  CustomerServiceOutlined,
  PlaySquareOutlined,
  UserOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { isAdmin } from "@/store/slices/authSlice";
import { toggleSidebar } from "@/store/slices/uiSlice";
import styles from "./Sidebar.module.css";

const { Sider } = Layout;
const { Title } = Typography;

type MenuItem = Required<MenuProps>["items"][number];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const themeMode = useAppSelector((state) => state.ui.theme);
  const user = useAppSelector((state) => state.auth.user);
  const userIsAdmin = isAdmin(user);
  const { token } = theme.useToken();

  const menuItems: MenuItem[] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "/dashboard/songs",
      icon: <CustomerServiceOutlined />,
      label: <Link href="/dashboard/songs">Bài hát</Link>,
    },
    {
      key: "/dashboard/albums",
      icon: <PlaySquareOutlined />,
      label: <Link href="/dashboard/albums">Albums</Link>,
    },
    ...(userIsAdmin
      ? [
          {
            key: "/dashboard/artists",
            icon: <TeamOutlined />,
            label: <Link href="/dashboard/artists">Nghệ sĩ</Link>,
          },
          {
            key: "/dashboard/genres",
            icon: <AppstoreOutlined />,
            label: <Link href="/dashboard/genres">Thể loại</Link>,
          },
          {
            key: "divider-1",
            type: "divider" as const,
          },
          {
            key: "/dashboard/approvals",
            icon: <CheckSquareOutlined />,
            label: <Link href="/dashboard/approvals">Duyệt bài</Link>,
          },
          {
            key: "/dashboard/users",
            icon: <UserOutlined />,
            label: <Link href="/dashboard/users">Người dùng</Link>,
          },
        ]
      : []),
    {
      key: "divider-2",
      type: "divider" as const,
    },
    {
      key: "/dashboard/settings",
      icon: <SettingOutlined />,
      label: <Link href="/dashboard/settings">Cài đặt</Link>,
    },
  ];

  const getSelectedKey = () => {
    // Find the most specific matching path
    const matchingKeys = menuItems
      .filter(
        (item): item is MenuItem & { key: string } =>
          item !== null &&
          "key" in item &&
          typeof item.key === "string" &&
          pathname.startsWith(item.key),
      )
      .map((item) => item.key)
      .sort((a, b) => b.length - a.length);

    return matchingKeys[0] || "/dashboard";
  };

  return (
    <Sider
      theme={themeMode}
      width={240}
      collapsedWidth={80}
      collapsed={collapsed}
      className={styles.sidebar}
      trigger={null}
      collapsible
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        className={styles.logo}
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <Link href="/dashboard">
          <div className={styles.logoContent}>
            <svg viewBox="0 0 24 24" width="32" height="32">
              <circle cx="12" cy="12" r="10" fill={token.colorPrimary} />
              <path d="M8 15V9l8 3-8 3z" fill="white" />
            </svg>
            {!collapsed && (
              <Title
                level={4}
                className={styles.logoText}
                style={{ color: token.colorText }}
              >
                Melodix
              </Title>
            )}
          </div>
        </Link>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        className={styles.menu}
      />

      {/* Collapse button */}
      <Button
        className={styles.collapseButton}
        style={{
          background: token.colorBgContainer,
          color: token.colorText,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        icon={
          collapsed ? (
            <RightOutlined style={{ fontSize: "12px" }} />
          ) : (
            <LeftOutlined style={{ fontSize: "12px" }} />
          )
        }
        onClick={() => dispatch(toggleSidebar())}
        shape="circle"
        size="small"
      />
    </Sider>
  );
}

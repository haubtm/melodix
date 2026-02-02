"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Typography, Avatar, Divider, Button } from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  HeartOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import styles from "./Sidebar.module.css";

const { Sider } = Layout;
const { Text } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  path: string;
}

const mainMenuItems: MenuItem[] = [
  {
    key: "home",
    icon: <HomeOutlined />,
    label: "Trang chủ",
    path: "/",
  },
  {
    key: "search",
    icon: <SearchOutlined />,
    label: "Tìm kiếm",
    path: "/search",
  },
];

const libraryMenuItems: MenuItem[] = [
  {
    key: "liked",
    icon: <HeartOutlined />,
    label: "Bài hát yêu thích",
    path: "/library/liked",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const getSelectedKeys = () => {
    const item = [...mainMenuItems, ...libraryMenuItems].find(
      (item) => item.path === pathname,
    );
    return item ? [item.key] : [];
  };

  return (
    <Sider
      width={280}
      collapsedWidth={72}
      collapsed={sidebarCollapsed}
      className={styles.sidebar}
      trigger={null}
      collapsible
    >
      {/* Logo */}
      <div className={styles.logo}>
        <Link href="/">
          <div className={styles.logoContent}>
            <div className={styles.logoIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="32"
                height="32"
              >
                <circle cx="12" cy="12" r="10" fill="#1DB954" />
                <path d="M8 15V9l8 3-8 3z" fill="white" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <Text className={styles.logoText}>Melodix</Text>
            )}
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className={styles.menuSection}>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          className={styles.menu}
          items={mainMenuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link href={item.path}>{item.label}</Link>,
          }))}
        />
      </div>

      <Divider className={styles.divider} />

      {/* Library Section */}
      <div className={styles.librarySection}>
        <div className={styles.libraryHeader}>
          <UnorderedListOutlined className={styles.libraryIcon} />
          {!sidebarCollapsed && (
            <Text className={styles.libraryTitle}>Thư viện</Text>
          )}
          {!sidebarCollapsed && isAuthenticated && (
            <Button
              type="text"
              icon={<PlusOutlined />}
              className={styles.addButton}
              title="Tạo playlist mới"
            />
          )}
        </div>

        {isAuthenticated ? (
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            className={styles.menu}
            items={libraryMenuItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: <Link href={item.path}>{item.label}</Link>,
            }))}
          />
        ) : (
          !sidebarCollapsed && (
            <div className={styles.loginPrompt}>
              <Text className={styles.promptText}>
                Đăng nhập để tạo playlist và lưu bài hát yêu thích
              </Text>
              <Link href="/login">
                <Button type="primary" className={styles.loginButton}>
                  Đăng nhập
                </Button>
              </Link>
            </div>
          )
        )}
      </div>
    </Sider>
  );
}

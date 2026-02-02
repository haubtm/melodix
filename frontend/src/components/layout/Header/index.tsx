"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout, Input, Avatar, Dropdown, Button, Space } from "antd";
import type { MenuProps } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import styles from "./Header.module.css";

const { Header: AntHeader } = Layout;

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link href="/profile">Hồ sơ</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link href="/settings">Cài đặt</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <AntHeader className={styles.header}>
      {/* Navigation Arrows */}
      <div className={styles.navigation}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          className={styles.navButton}
          onClick={() => router.back()}
        />
        <Button
          type="text"
          icon={<RightOutlined />}
          className={styles.navButton}
          onClick={() => router.forward()}
        />
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <Input
          prefix={<SearchOutlined className={styles.searchIcon} />}
          placeholder="Bạn muốn nghe gì?"
          className={styles.searchInput}
          size="large"
          onPressEnter={(e) =>
            handleSearch((e.target as HTMLInputElement).value)
          }
        />
      </div>

      {/* User Section */}
      <div className={styles.userSection}>
        {isAuthenticated && user ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className={styles.userButton}>
              <Avatar
                src={user.avatarUrl}
                icon={!user.avatarUrl && <UserOutlined />}
                className={styles.avatar}
              />
              <span className={styles.userName}>
                {user.displayName || user.username}
              </span>
            </div>
          </Dropdown>
        ) : (
          <Space size="middle">
            <Link href="/register">
              <Button type="text" className={styles.registerButton}>
                Đăng ký
              </Button>
            </Link>
            <Link href="/login">
              <Button type="primary" className={styles.loginButton}>
                Đăng nhập
              </Button>
            </Link>
          </Space>
        )}
      </div>
    </AntHeader>
  );
}

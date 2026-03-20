"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout, Avatar, Dropdown, Button, Space } from "antd";
import type { MenuProps } from "antd";
import {
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
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );

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

      {/* User Section */}
      <div className={styles.userSection}>
        {isLoading ? (
          <div className={styles.authPlaceholder} />
        ) : isAuthenticated && user ? (
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

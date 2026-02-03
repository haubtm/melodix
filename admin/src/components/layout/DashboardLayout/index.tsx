"use client";

import React from "react";
import { Layout, theme } from "antd";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { useAppSelector } from "@/store/hooks";
import styles from "./DashboardLayout.module.css";

const { Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { token } = theme.useToken();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <Layout className={styles.layout}>
      <Sidebar />
      <Layout
        className={styles.mainLayout}
        style={{ marginLeft: collapsed ? 80 : 240 }}
      >
        <Header />
        <Content
          className={styles.content}
          style={{ background: token.colorBgLayout }}
        >
          <div className={styles.contentInner}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}

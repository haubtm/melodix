"use client";

import React from "react";
import { Layout } from "antd";
import Sidebar from "../Sidebar";
import Header from "../Header";
import MusicPlayer from "../MusicPlayer";
import styles from "./MainLayout.module.css";

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Layout className={styles.layout}>
      <Sidebar />
      <Layout className={styles.mainContent}>
        <Header />
        <Content className={styles.content}>
          <div className={styles.scrollContainer}>{children}</div>
        </Content>
      </Layout>
      <MusicPlayer />
    </Layout>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  App,
  Button,
  Divider,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Row,
  Col,
  Spin,
  Switch,
  Typography,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  CustomerServiceOutlined,
  HeartOutlined,
  HistoryOutlined,
  HomeOutlined,
  PlusOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { playlistsApi, uploadApi } from "@/api";
import { Playlist } from "@/dtos";
import { PlaylistCoverField } from "@/components/music";
import { useAppSelector } from "@/store/hooks";
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
  { key: "home", icon: <HomeOutlined />, label: "Trang chủ", path: "/" },
  { key: "songs", icon: <CustomerServiceOutlined />, label: "Bài hát", path: "/songs" },
  { key: "search", icon: <SearchOutlined />, label: "Tìm kiếm", path: "/search" },
];

const libraryMenuItems: MenuItem[] = [
  { key: "history", icon: <HistoryOutlined />, label: "Nghe gần đây", path: "/history" },
  { key: "liked", icon: <HeartOutlined />, label: "Bài hát yêu thích", path: "/library/liked" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { message } = App.useApp();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createCoverFiles, setCreateCoverFiles] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const getSelectedKeys = () => {
    const item = [...mainMenuItems, ...libraryMenuItems].find(
      (menuItem) => menuItem.path === pathname,
    );

    if (item) {
      return [item.key];
    }

    const playlistMatch = playlists.find((playlist) => pathname === `/playlist/${playlist.id}`);
    return playlistMatch ? [`playlist-${playlistMatch.id}`] : [];
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setPlaylists([]);
      return;
    }

    let isMounted = true;

    const loadPlaylists = async () => {
      setLoadingPlaylists(true);

      try {
        const response = await playlistsApi.getMine(1, 50);
        if (isMounted) {
          setPlaylists(response.data || []);
        }
      } catch {
        if (isMounted) {
          setPlaylists([]);
        }
      } finally {
        if (isMounted) {
          setLoadingPlaylists(false);
        }
      }
    };

    void loadPlaylists();

    const handlePlaylistChanged = () => {
      void loadPlaylists();
    };

    window.addEventListener("melodix:playlist-changed", handlePlaylistChanged);

    return () => {
      isMounted = false;
      window.removeEventListener("melodix:playlist-changed", handlePlaylistChanged);
    };
  }, [isAuthenticated]);

  const handleCreatePlaylist = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);

      let imageUrl: string | undefined;
      const file = createCoverFiles[0]?.originFileObj;
      if (file) {
        imageUrl = await uploadApi.uploadFile(file, "playlists");
      }

      const playlist = await playlistsApi.create({
        ...values,
        imageUrl,
      });

      setCreateOpen(false);
      form.resetFields();
      setCreateCoverFiles([]);
      message.success("Đã tạo playlist.");
      window.dispatchEvent(
        new CustomEvent("melodix:playlist-changed", {
          detail: { playlistId: playlist.id },
        }),
      );
      router.push(`/playlist/${playlist.id}`);
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        return;
      }

      message.error("Không thể tạo playlist lúc này.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Sider
        width={280}
        collapsedWidth={72}
        collapsed={sidebarCollapsed}
        className={styles.sidebar}
        trigger={null}
        collapsible
      >
        <div className={styles.logo}>
          <Link href="/">
            <div className={styles.logoContent}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                  <circle cx="12" cy="12" r="10" fill="#1DB954" />
                  <path d="M8 15V9l8 3-8 3z" fill="white" />
                </svg>
              </div>
              {!sidebarCollapsed && <Text className={styles.logoText}>Melodix</Text>}
            </div>
          </Link>
        </div>

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

        <div className={styles.librarySection}>
          <div className={styles.libraryHeader}>
            <UnorderedListOutlined className={styles.libraryIcon} />
            {!sidebarCollapsed && <Text className={styles.libraryTitle}>Thư viện</Text>}
            {!sidebarCollapsed && isAuthenticated && (
              <Button
                type="text"
                icon={<PlusOutlined />}
                className={styles.addButton}
                title="Tạo playlist mới"
                onClick={() => setCreateOpen(true)}
              />
            )}
          </div>

          {isAuthenticated ? (
            <>
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

              {!sidebarCollapsed && (
                <div className={styles.playlistSection}>
                  <div className={styles.playlistHeader}>Playlist của bạn</div>
                  {loadingPlaylists ? (
                    <div className={styles.playlistLoading}>
                      <Spin size="small" />
                    </div>
                  ) : playlists.length ? (
                    <div className={styles.playlistList}>
                      {playlists.map((playlist) => (
                        <Link
                          key={playlist.id}
                          href={`/playlist/${playlist.id}`}
                          className={`${styles.playlistItem} ${
                            pathname === `/playlist/${playlist.id}` ? styles.playlistItemActive : ""
                          }`}
                        >
                          <span className={styles.playlistName}>{playlist.name}</span>
                          <span className={styles.playlistMeta}>{playlist.totalTracks} bài hát</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.playlistEmpty}>Chưa có playlist nào.</div>
                  )}
                </div>
              )}
            </>
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

      <Modal
        title="Tạo playlist"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
          setCreateCoverFiles([]);
        }}
        onOk={() => void handleCreatePlaylist()}
        okText="Tạo"
        confirmLoading={creating}
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isPublic: false,
          }}
        >
          <Form.Item
            name="name"
            label="Tên playlist"
            rules={[{ required: true, message: "Nhập tên playlist" }]}
          >
            <Input placeholder="Ví dụ: Chill đêm muộn" />
          </Form.Item>

          <Row gutter={16} align="middle">
            <Col span={16}>
              <PlaylistCoverField fileList={createCoverFiles} onChange={setCreateCoverFiles} />
            </Col>
            <Col span={8}>
              <Form.Item name="isPublic" label="Công khai" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về playlist" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

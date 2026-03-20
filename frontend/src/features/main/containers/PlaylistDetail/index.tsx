"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { App, Button, Empty, Form, Input, Modal, Skeleton, Switch, Row, Col } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { DeleteOutlined, PauseCircleFilled, PlayCircleFilled } from "@ant-design/icons";
import MainLayout from "@/components/layout/MainLayout";
import FallbackImage from "@/components/common/FallbackImage";
import { PlaylistCoverField } from "@/components/music";
import SongCard from "@/components/music/SongCard";
import { Playlist, PlaylistSong } from "@/dtos";
import { playlistsApi, uploadApi } from "@/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playSong, togglePlay } from "@/store/slices/playerSlice";
import styles from "./PlaylistDetail.module.css";

interface PlaylistDetailContainerProps {
  playlist?: Playlist;
  playlistId?: number;
}

function formatDuration(durationMs: number) {
  const totalMinutes = Math.floor(durationMs / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes} phút`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} giờ ${minutes} phút`;
}

export function PlaylistDetailContainer({
  playlist: initialPlaylist,
  playlistId,
}: PlaylistDetailContainerProps) {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentSong, isPlaying } = useAppSelector((state) => state.player);
  const [playlist, setPlaylist] = useState<Playlist | null>(initialPlaylist || null);
  const [items, setItems] = useState<PlaylistSong[]>(initialPlaylist?.songs || []);
  const [loading, setLoading] = useState(!initialPlaylist);
  const [removingSongId, setRemovingSongId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editCoverFiles, setEditCoverFiles] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const loadPlaylist = useCallback(async () => {
    if (!playlistId) {
      return;
    }

    setLoading(true);

    try {
      const result = await playlistsApi.getById(playlistId);
      setPlaylist(result);
      setItems(result.songs || []);
    } catch {
      setPlaylist(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (initialPlaylist) {
      setPlaylist(initialPlaylist);
      setItems(initialPlaylist.songs || []);
      return;
    }

    void loadPlaylist();
  }, [initialPlaylist, loadPlaylist]);

  useEffect(() => {
    if (!playlistId) {
      return;
    }

    const handlePlaylistChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ playlistId?: number }>).detail;
      if (!detail?.playlistId || detail.playlistId === playlistId) {
        void loadPlaylist();
      }
    };

    window.addEventListener("melodix:playlist-changed", handlePlaylistChanged);

    return () => {
      window.removeEventListener("melodix:playlist-changed", handlePlaylistChanged);
    };
  }, [loadPlaylist, playlistId]);

  const songs = useMemo(() => items.map((item) => item.song), [items]);
  const isOwner = Boolean(user && playlist?.owner && user.id === playlist.owner.id);
  const isCurrentPlaylistPlaying =
    songs.some((song) => song.id === currentSong?.id) && isPlaying;

  if (loading) {
    return (
      <MainLayout>
        <Skeleton active paragraph={{ rows: 8 }} />
      </MainLayout>
    );
  }

  if (!playlist) {
    return (
      <MainLayout>
        <Empty description="Không thể tải playlist này." />
      </MainLayout>
    );
  }

  const handlePlay = () => {
    if (!songs.length) {
      return;
    }

    if (songs.some((song) => song.id === currentSong?.id)) {
      dispatch(togglePlay());
      return;
    }

    dispatch(
      playSong({
        song: songs[0],
        playlist: songs,
      }),
    );
  };

  const handleRemoveSong = async (songId: number) => {
    setRemovingSongId(songId);

    try {
      await playlistsApi.removeSong(playlist.id, songId);
      window.dispatchEvent(
        new CustomEvent("melodix:playlist-changed", {
          detail: { playlistId: playlist.id, songId },
        }),
      );
      message.success("Đã xóa bài khỏi playlist.");
    } catch {
      message.error("Không thể xóa bài khỏi playlist.");
    } finally {
      setRemovingSongId(null);
    }
  };

  const openEditModal = () => {
    if (!isOwner) {
      return;
    }

    form.setFieldsValue({
      name: playlist.name,
      description: playlist.description || "",
      isPublic: playlist.isPublic,
    });
    setEditCoverFiles([]);
    setEditOpen(true);
  };

  const handleUpdatePlaylist = async () => {
    try {
      const values = await form.validateFields();
      setUpdating(true);
      let imageUrl = playlist.imageUrl || undefined;

      const file = editCoverFiles[0]?.originFileObj;
      if (file) {
        imageUrl = await uploadApi.uploadFile(file, "playlists");
      }

      const updatedPlaylist = await playlistsApi.update(playlist.id, {
        ...values,
        imageUrl,
      });
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              ...updatedPlaylist,
              songs: prev.songs,
            }
          : updatedPlaylist,
      );
      setEditOpen(false);
      setEditCoverFiles([]);
      window.dispatchEvent(
        new CustomEvent("melodix:playlist-changed", {
          detail: { playlistId: playlist.id },
        }),
      );
      message.success("Đã cập nhật playlist.");
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        return;
      }

      message.error("Không thể cập nhật playlist.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <button
            type="button"
            className={`${styles.coverButton} ${isOwner ? styles.editable : ""}`}
            onClick={openEditModal}
            disabled={!isOwner}
          >
            <FallbackImage
              src={playlist.coverUrl || playlist.imageUrl}
              fallbackSrc="/images/default-cover.svg"
              alt={playlist.name}
              width={220}
              height={220}
              className={styles.cover}
            />
          </button>

          <div className={styles.heroInfo}>
            <p className={styles.eyebrow}>Playlist</p>
            <button
              type="button"
              className={`${styles.titleButton} ${isOwner ? styles.editable : ""}`}
              onClick={openEditModal}
              disabled={!isOwner}
            >
              <h1 className={styles.title}>{playlist.name}</h1>
            </button>
            {playlist.description && <p className={styles.description}>{playlist.description}</p>}
            <div className={styles.meta}>
              <span className={styles.metaItem}>{songs.length} bài hát</span>
              <span className={styles.metaItem}>{formatDuration(playlist.durationMs)}</span>
              <span className={styles.metaItem}>
                {playlist.isPublic ? "Công khai" : "Riêng tư"}
              </span>
              {playlist.owner && (
                <span className={styles.metaItem}>
                  {playlist.owner.displayName || playlist.owner.username}
                </span>
              )}
            </div>
            <Button
              type="primary"
              className={styles.playButton}
              icon={isCurrentPlaylistPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
              onClick={handlePlay}
              disabled={!songs.length}
            >
              {isCurrentPlaylistPlaying ? "Tạm dừng" : "Phát playlist"}
            </Button>
          </div>
        </section>

        <section className={styles.songs}>
          <h2 className={styles.sectionTitle}>Danh sách bài hát</h2>
          {items.length ? (
            items.map((item, index) => (
              <div key={item.id} className={styles.songRow}>
                <SongCard song={item.song} playlist={songs} index={index} showAlbum />
                {isOwner && (
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    loading={removingSongId === item.song.id}
                    onClick={() => void handleRemoveSong(item.song.id)}
                    className={styles.removeButton}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            ))
          ) : (
            <Empty description="Playlist này chưa có bài hát nào." />
          )}
        </section>
      </div>

      <Modal
        title="Chỉnh sửa playlist"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditCoverFiles([]);
        }}
        onOk={() => void handleUpdatePlaylist()}
        okText="Lưu"
        confirmLoading={updating}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên playlist"
            rules={[{ required: true, message: "Nhập tên playlist" }]}
          >
            <Input placeholder="Tên playlist" />
          </Form.Item>

          <Row gutter={16} align="middle">
            <Col span={16}>
              <PlaylistCoverField
                fileList={editCoverFiles}
                initialImageUrl={playlist.coverUrl || playlist.imageUrl || undefined}
                onChange={setEditCoverFiles}
              />
            </Col>
            <Col span={8}>
              <Form.Item name="isPublic" label="Công khai" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}

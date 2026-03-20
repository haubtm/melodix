"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { App, Button, Empty, Skeleton } from "antd";
import { DeleteOutlined, PauseCircleFilled, PlayCircleFilled } from "@ant-design/icons";
import MainLayout from "@/components/layout/MainLayout";
import SongCard from "@/components/music/SongCard";
import { Playlist, PlaylistSong } from "@/dtos";
import { playlistsApi } from "@/api";
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

  useEffect(() => {
    if (initialPlaylist || !playlistId) {
      return;
    }

    let isMounted = true;

    const loadPlaylist = async () => {
      setLoading(true);
      try {
        const result = await playlistsApi.getById(playlistId);
        if (!isMounted) return;
        setPlaylist(result);
        setItems(result.songs || []);
      } catch {
        if (!isMounted) return;
        setPlaylist(null);
        setItems([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPlaylist();

    return () => {
      isMounted = false;
    };
  }, [initialPlaylist, playlistId]);

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
      setItems((prev) => prev.filter((item) => item.song.id !== songId));
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              totalTracks: Math.max(prev.totalTracks - 1, 0),
            }
          : prev,
      );
      window.dispatchEvent(new CustomEvent("melodix:playlist-changed"));
      message.success("Đã xóa bài khỏi playlist.");
    } catch {
      message.error("Không thể xóa bài khỏi playlist.");
    } finally {
      setRemovingSongId(null);
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <Image
            src={playlist.coverUrl || playlist.imageUrl || "/images/default-cover.jpg"}
            alt={playlist.name}
            width={220}
            height={220}
            className={styles.cover}
          />

          <div className={styles.heroInfo}>
            <p className={styles.eyebrow}>Playlist</p>
            <h1 className={styles.title}>{playlist.name}</h1>
            {playlist.description && <p className={styles.description}>{playlist.description}</p>}
            <div className={styles.meta}>
              <span className={styles.metaItem}>{songs.length} bài hát</span>
              <span className={styles.metaItem}>{formatDuration(playlist.durationMs)}</span>
              <span className={styles.metaItem}>
                {playlist.isPublic ? "Công khai" : "Riêng tư"}
              </span>
              {playlist.owner && (
                <span className={styles.metaItem}>{playlist.owner.displayName || playlist.owner.username}</span>
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
          {items.map((item, index) => (
            <div key={item.id} className={styles.songRow}>
              <SongCard
                song={item.song}
                playlist={songs}
                index={index}
                showAlbum
              />
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
          ))}
        </section>
      </div>
    </MainLayout>
  );
}

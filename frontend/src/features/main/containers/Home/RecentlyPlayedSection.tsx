"use client";

import { useEffect, useMemo, useState } from "react";
import { Empty, Skeleton } from "antd";
import SongCard from "@/components/music/SongCard";
import { playbackApi } from "@/api";
import { RecentlyPlayedItem, Song } from "@/dtos";
import { useAppSelector } from "@/store/hooks";
import styles from "@/app/page.module.css";

export function RecentlyPlayedSection() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [items, setItems] = useState<RecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    let isMounted = true;

    const loadRecentlyPlayed = async () => {
      setLoading(true);

      try {
        const nextItems = await playbackApi.getRecentlyPlayed(8);
        if (!isMounted) return;
        setItems(nextItems);
      } catch {
        if (!isMounted) return;
        setItems([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadRecentlyPlayed();

    const handlePlayRecorded = () => {
      void loadRecentlyPlayed();
    };

    window.addEventListener("melodix:play-recorded", handlePlayRecorded);

    return () => {
      isMounted = false;
      window.removeEventListener("melodix:play-recorded", handlePlayRecorded);
    };
  }, [isAuthenticated]);

  const songs = useMemo<Song[]>(() => items.map((item) => item.song), [items]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Nghe gần đây</h2>
      </div>

      {loading ? (
        <div className={styles.songList}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton.Input
              key={`recently-played-skeleton-${index}`}
              active
              block
              className={styles.recentlyPlayedSkeleton}
            />
          ))}
        </div>
      ) : songs.length ? (
        <div className={styles.songList}>
          {songs.map((song, index) => (
            <SongCard
              key={`recently-played-${song.id}-${index}`}
              song={song}
              playlist={songs}
              index={index}
              showAlbum
            />
          ))}
        </div>
      ) : (
        <Empty description="Chưa có lịch sử nghe gần đây" />
      )}
    </section>
  );
}

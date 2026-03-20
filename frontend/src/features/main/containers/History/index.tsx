"use client";

import { useEffect, useState } from "react";
import { Empty, Skeleton } from "antd";
import MainLayout from "@/components/layout/MainLayout";
import SongCard from "@/components/music/SongCard";
import { playbackApi } from "@/api";
import { RecentlyPlayedItem } from "@/dtos";
import styles from "./HistoryPage.module.css";

function formatPlayedAt(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function HistoryPageContainer() {
  const [items, setItems] = useState<RecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);

      try {
        const nextItems = await playbackApi.getRecentlyPlayed(50);
        if (isMounted) {
          setItems(nextItems);
        }
      } catch {
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();

    const handleRecorded = () => {
      void load();
    };

    window.addEventListener("melodix:play-recorded", handleRecorded);

    return () => {
      isMounted = false;
      window.removeEventListener("melodix:play-recorded", handleRecorded);
    };
  }, []);

  return (
    <MainLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Thư viện cá nhân</p>
          <h1 className={styles.title}>Lịch sử nghe</h1>
          <p className={styles.description}>
            Xem lại những bài hát đã phát gần đây và tiếp tục nghe lại ngay từ đúng
            player hiện tại.
          </p>
          {!loading && (
            <span className={styles.meta}>{items.length} mục gần đây</span>
          )}
        </section>

        {loading ? (
          <div className={styles.list}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton.Input key={`history-skeleton-${index}`} active block />
            ))}
          </div>
        ) : items.length ? (
          <div className={styles.list}>
            {items.map((item, index) => (
              <div key={`${item.song.id}-${item.playedAt}-${index}`} className={styles.songCardWrap}>
                <span className={styles.time}>{formatPlayedAt(item.playedAt)}</span>
                <SongCard
                  song={item.song}
                  playlist={items.map((entry) => entry.song)}
                  index={index}
                  showAlbum
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Empty description="Chưa có lịch sử nghe nào." />
          </div>
        )}
      </div>
    </MainLayout>
  );
}


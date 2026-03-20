"use client";

import { useEffect, useState } from "react";
import { Empty, Skeleton } from "antd";
import MainLayout from "@/components/layout/MainLayout";
import SongCard from "@/components/music/SongCard";
import { libraryApi } from "@/api";
import { Song } from "@/dtos";
import styles from "./LikedSongsPage.module.css";

export function LikedSongsPageContainer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);

      try {
        const response = await libraryApi.getLikedSongs(1, 100);
        if (isMounted) {
          setSongs(response.data || []);
        }
      } catch {
        if (isMounted) {
          setSongs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();

    const handleLibraryChanged = () => {
      void load();
    };

    window.addEventListener("melodix:library-changed", handleLibraryChanged);

    return () => {
      isMounted = false;
      window.removeEventListener("melodix:library-changed", handleLibraryChanged);
    };
  }, []);

  return (
    <MainLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Thư viện cá nhân</p>
          <h1 className={styles.title}>Bài hát yêu thích</h1>
          <p className={styles.description}>
            Danh sách này lấy trực tiếp từ thư viện backend của tài khoản hiện tại.
          </p>
        </section>

        {loading ? (
          <div className={styles.list}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton.Input key={`liked-skeleton-${index}`} active block />
            ))}
          </div>
        ) : songs.length ? (
          <div className={styles.list}>
            {songs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                playlist={songs}
                index={index}
                showAlbum
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Empty description="Bạn chưa thích bài hát nào." />
          </div>
        )}
      </div>
    </MainLayout>
  );
}


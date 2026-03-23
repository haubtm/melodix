"use client";

import { useMemo, useState } from "react";
import {
  CustomerServiceOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import MainLayout from "@/components/layout/MainLayout";
import FallbackImage from "@/components/common/FallbackImage";
import AlbumCard from "@/components/music/AlbumCard";
import SongCard from "@/components/music/SongCard";
import { Album, Artist, Song } from "@/dtos";
import styles from "./ArtistDetail.module.css";

interface ArtistDetailContainerProps {
  artist: Artist;
  songs: Song[];
  albums: Album[];
}

function formatListeners(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString("vi-VN");
}

export function ArtistDetailContainer({
  artist,
  songs,
  albums,
}: ArtistDetailContainerProps) {
  const [bioExpanded, setBioExpanded] = useState(false);

  const shouldCollapseBio = (artist.bio?.length || 0) > 320;
  const bioContent = useMemo(() => {
    if (!artist.bio) {
      return "";
    }

    if (bioExpanded || !shouldCollapseBio) {
      return artist.bio;
    }

    return `${artist.bio.slice(0, 320).trim()}...`;
  }, [artist.bio, bioExpanded, shouldCollapseBio]);

  const songCount = artist.songCount ?? songs.length;
  const albumCount = artist.albumCount ?? albums.length;

  return (
    <MainLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <FallbackImage
              src={artist.avatarUrl}
              fallbackSrc="/images/default-artist.svg"
              alt={artist.name}
              width={160}
              height={160}
              className={styles.avatar}
            />

            <div className={styles.heroInfo}>
              <p className={styles.eyebrow}>Nghệ sĩ</p>
              <h1 className={styles.title}>{artist.name}</h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <CustomerServiceOutlined />
                  <span>{formatListeners(artist.monthlyListeners)} người nghe</span>
                </span>
                {artist.verified && (
                  <span className={styles.metaItem}>
                    <SafetyCertificateFilled />
                    <span>Đã xác minh</span>
                  </span>
                )}
                <span className={styles.metaItem}>{songCount} bài hát</span>
                <span className={styles.metaItem}>{albumCount} album</span>
              </div>
            </div>
          </div>

          {artist.bio && (
            <div className={styles.bioSection}>
              <p className={styles.bio}>{bioContent}</p>
              {shouldCollapseBio && (
                <button
                  type="button"
                  className={styles.expandButton}
                  onClick={() => setBioExpanded((current) => !current)}
                >
                  {bioExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>
          )}
        </section>

        {songs.length > 0 && (
          <section className={`${styles.section} ${styles.songsSection}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Bài hát nổi bật</h2>
            </div>
            <div className={styles.songs}>
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
          </section>
        )}

        {albums.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Album</h2>
            </div>
            <div className={styles.albums}>
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}

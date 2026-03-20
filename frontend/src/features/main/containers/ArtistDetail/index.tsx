"use client";

import Image from "next/image";
import { CustomerServiceOutlined, SafetyCertificateFilled } from "@ant-design/icons";
import MainLayout from "@/components/layout/MainLayout";
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
  return (
    <MainLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <Image
            src={artist.avatarUrl || "/images/default-artist.jpg"}
            alt={artist.name}
            width={220}
            height={220}
            className={styles.avatar}
          />

          <div className={styles.heroInfo}>
            <p className={styles.eyebrow}>Nghệ sĩ</p>
            <h1 className={styles.title}>{artist.name}</h1>
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <CustomerServiceOutlined /> {formatListeners(artist.monthlyListeners)} người nghe
              </span>
              {artist.verified && (
                <span className={styles.metaItem}>
                  <SafetyCertificateFilled /> Đã xác minh
                </span>
              )}
              <span className={styles.metaItem}>{songs.length} bài hát</span>
              <span className={styles.metaItem}>{albums.length} album</span>
            </div>
            {artist.bio && <p className={styles.bio}>{artist.bio}</p>}
          </div>
        </section>

        {songs.length > 0 && (
          <section className={styles.section}>
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


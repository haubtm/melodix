import React from "react";
import { Empty } from "antd";
import MainLayout from "@/components/layout/MainLayout";
import SongCard from "@/components/music/SongCard";
import AlbumCard from "@/components/music/AlbumCard";
import ArtistCard from "@/components/music/ArtistCard";
import { Album, Artist, Song } from "@/dtos";
import { RecentlyPlayedSection } from "./RecentlyPlayedSection";
import styles from "@/app/page.module.css";

interface HomeContainerProps {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
}

export function HomeContainer({ songs, albums, artists }: HomeContainerProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.greeting}>
          {greeting}
        </h1>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Bài hát phổ biến
            </h2>
          </div>

          {songs.length ? (
            <div className={styles.songList}>
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
            <Empty description="Chưa có bài hát nào" />
          )}
        </section>

        <RecentlyPlayedSection />

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Album nổi bật
            </h2>
          </div>

          {albums.length ? (
            <div className={styles.cardGrid}>
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <Empty description="Chưa có album nào" />
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Nghệ sĩ phổ biến
            </h2>
          </div>

          {artists.length ? (
            <div className={styles.cardGrid}>
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <Empty description="Chưa có nghệ sĩ nào" />
          )}
        </section>
      </div>
    </MainLayout>
  );
}

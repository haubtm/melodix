"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "antd";
import { PauseCircleFilled, PlayCircleFilled } from "@ant-design/icons";
import MainLayout from "@/components/layout/MainLayout";
import AlbumCard from "@/components/music/AlbumCard";
import SongCard from "@/components/music/SongCard";
import { Album, Song } from "@/dtos";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playSong, togglePlay } from "@/store/slices/playerSlice";
import styles from "./AlbumDetail.module.css";

interface AlbumDetailContainerProps {
  album: Album;
  songs: Song[];
  moreAlbums: Album[];
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

export function AlbumDetailContainer({
  album,
  songs,
  moreAlbums,
}: AlbumDetailContainerProps) {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying } = useAppSelector((state) => state.player);

  const firstSong = songs[0];
  const isCurrentAlbumPlaying =
    Boolean(firstSong) && songs.some((song) => song.id === currentSong?.id) && isPlaying;

  const handlePlay = () => {
    if (!firstSong) {
      return;
    }

    if (songs.some((song) => song.id === currentSong?.id)) {
      dispatch(togglePlay());
      return;
    }

    dispatch(
      playSong({
        song: firstSong,
        playlist: songs,
      }),
    );
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <Image
            src={album.coverUrl || "/images/default-cover.jpg"}
            alt={album.title}
            width={220}
            height={220}
            className={styles.cover}
          />

          <div className={styles.heroInfo}>
            <p className={styles.eyebrow}>Album</p>
            <h1 className={styles.title}>{album.title}</h1>
            {album.artist && (
              <Link href={`/artist/${album.artist.id}`} className={styles.artistLink}>
                {album.artist.name}
              </Link>
            )}
            <div className={styles.meta}>
              <span className={styles.metaItem}>{songs.length} bài hát</span>
              <span className={styles.metaItem}>{formatDuration(album.durationMs)}</span>
              {album.releaseDate && (
                <span className={styles.metaItem}>
                  {new Date(album.releaseDate).getFullYear()}
                </span>
              )}
              <span className={styles.metaItem}>{album.albumType.toUpperCase()}</span>
            </div>
            {album.description && <p className={styles.description}>{album.description}</p>}
            <div className={styles.actions}>
              <Button
                type="primary"
                className={styles.playButton}
                icon={isCurrentAlbumPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
                onClick={handlePlay}
                disabled={!firstSong}
              >
                {isCurrentAlbumPlaying ? "Tạm dừng" : "Phát album"}
              </Button>
            </div>
          </div>
        </section>

        {songs.length > 0 && (
          <section className={styles.songs}>
            <h2 className={styles.sectionTitle}>Danh sách bài hát</h2>
            <div className={styles.songList}>
              {songs.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  playlist={songs}
                  index={index}
                  showAlbum={false}
                />
              ))}
            </div>
          </section>
        )}

        {moreAlbums.length > 0 && (
          <section className={styles.moreAlbums}>
            <h2 className={styles.sectionTitle}>Album khác cùng nghệ sĩ</h2>
            <div className={styles.albumGrid}>
              {moreAlbums.map((relatedAlbum) => (
                <AlbumCard key={relatedAlbum.id} album={relatedAlbum} />
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}


"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Tag, Typography } from "antd";
import {
  ClockCircleOutlined,
  CustomerServiceOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
} from "@ant-design/icons";
import MainLayout from "@/components/layout/MainLayout";
import SongCard from "@/components/music/SongCard";
import { Song, SongArtistReference, SongGenreReference } from "@/dtos";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playSong, togglePlay } from "@/store/slices/playerSlice";
import styles from "./SongDetail.module.css";

const { Text } = Typography;

interface SongDetailContainerProps {
  song: Song;
  albumSongs?: Song[];
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes} phút ${seconds} giây`;
}

function formatPlayCount(count: number | string): string {
  const num = typeof count === "string" ? parseInt(count, 10) : count;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString("vi-VN");
}

export function SongDetailContainer({
  song,
  albumSongs = [],
}: SongDetailContainerProps) {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying } = useAppSelector((state) => state.player);

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const handlePlay = () => {
    if (isCurrentSong) {
      dispatch(togglePlay());
      return;
    }

    dispatch(playSong({ song, playlist: albumSongs.length ? albumSongs : [song] }));
  };

  const coverUrl =
    song.coverUrl || song.album?.coverUrl || "/images/default-cover.jpg";
  const artistName = song.primaryArtist?.name || song.artist?.name || "Unknown Artist";
  const artistId = song.primaryArtist?.id || song.artistId;
  const featuredArtists = song.songArtists || [];
  const genres = song.genres || [];

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.coverWrapper}>
            <Image
              src={coverUrl}
              alt={song.title}
              width={232}
              height={232}
              className={styles.cover}
              priority
            />
          </div>

          <div className={styles.heroInfo}>
            <Text className={styles.type}>Bài hát</Text>
            <h1 className={styles.title}>{song.title}</h1>

            <div className={styles.meta}>
              <Link href={`/artist/${artistId}`} className={styles.artistLink}>
                {artistName}
              </Link>

              {song.album && (
                <>
                  <span className={styles.dot}>•</span>
                  <Link
                    href={`/album/${song.album.id}`}
                    className={styles.albumLink}
                  >
                    {song.album.title}
                  </Link>
                </>
              )}

              {song.releasedAt && (
                <>
                  <span className={styles.dot}>•</span>
                  <span className={styles.year}>
                    {new Date(song.releasedAt).getFullYear()}
                  </span>
                </>
              )}

              <span className={styles.dot}>•</span>
              <span className={styles.duration}>
                <ClockCircleOutlined /> {formatDuration(song.durationMs)}
              </span>
            </div>

            {featuredArtists.length > 0 && (
              <div className={styles.featuredArtists}>
                <Text className={styles.featuredLabel}>Hát cùng: </Text>
                {featuredArtists.map(
                  (item: SongArtistReference, index: number) => (
                    <React.Fragment key={item.artist.id}>
                      {index > 0 && ", "}
                      <Link
                        href={`/artist/${item.artist.id}`}
                        className={styles.featuredLink}
                      >
                        {item.artist.name}
                      </Link>
                    </React.Fragment>
                  ),
                )}
              </div>
            )}

            {genres.length > 0 && (
              <div className={styles.genres}>
                {genres.map((item: SongGenreReference) => (
                  <Tag key={item.genre.id} className={styles.genreTag}>
                    {item.genre.name}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={
              isCurrentlyPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />
            }
            onClick={handlePlay}
            className={styles.playButton}
          />

          <div className={styles.stats}>
            <span className={styles.playCount}>
              <CustomerServiceOutlined /> {formatPlayCount(song.playCount)} lượt nghe
            </span>
          </div>

          {song.explicit && <Tag className={styles.explicitTag}>E</Tag>}
        </div>

        {song.lyrics && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Lời bài hát</h2>
            <div className={styles.lyrics}>
              {song.lyrics.split("\n").map((line, index) => (
                <p key={`${song.id}-lyric-${index}`} className={styles.lyricLine}>
                  {line || <br />}
                </p>
              ))}
            </div>
          </section>
        )}

        {albumSongs.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Bài hát khác trong album</h2>
            <div className={styles.songList}>
              {albumSongs
                .filter((albumSong) => albumSong.id !== song.id)
                .map((albumSong, index) => (
                  <SongCard
                    key={albumSong.id}
                    song={albumSong}
                    playlist={albumSongs}
                    index={index}
                    showAlbum={false}
                  />
                ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}

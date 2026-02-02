"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircleFilled, PauseCircleFilled } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playSong, togglePlay } from "@/store/slices/playerSlice";
import { Song } from "@/types";
import styles from "./SongCard.module.css";

interface SongCardProps {
  song: Song;
  playlist?: Song[];
  showArtist?: boolean;
  showAlbum?: boolean;
  index?: number;
}

export default function SongCard({
  song,
  playlist,
  showArtist = true,
  showAlbum = false,
  index,
}: SongCardProps) {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying } = useAppSelector((state) => state.player);

  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentSong) {
      dispatch(togglePlay());
    } else {
      dispatch(playSong({ song, playlist }));
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`${styles.card} ${isCurrentSong ? styles.active : ""}`}>
      {index !== undefined && (
        <div className={styles.index}>
          {isCurrentSong && isPlaying ? (
            <div className={styles.playingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
      )}

      <div className={styles.coverWrapper}>
        <Image
          src={
            song.coverUrl || song.album?.coverUrl || "/images/default-cover.jpg"
          }
          alt={song.title}
          width={48}
          height={48}
          className={styles.cover}
        />
        <button className={styles.playButton} onClick={handlePlay}>
          {isCurrentSong && isPlaying ? (
            <PauseCircleFilled />
          ) : (
            <PlayCircleFilled />
          )}
        </button>
      </div>

      <div className={styles.info}>
        <Link href={`/song/${song.id}`} className={styles.title}>
          {song.title}
        </Link>
        {showArtist && (
          <Link href={`/artist/${song.artistId}`} className={styles.artist}>
            {song.artist?.name || "Unknown Artist"}
          </Link>
        )}
      </div>

      {showAlbum && song.album && (
        <Link href={`/album/${song.album.id}`} className={styles.album}>
          {song.album.title}
        </Link>
      )}

      <div className={styles.duration}>{formatDuration(song.durationMs)}</div>
    </div>
  );
}

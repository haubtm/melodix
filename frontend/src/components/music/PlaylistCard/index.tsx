"use client";

import Link from "next/link";
import { PlayCircleFilled } from "@ant-design/icons";
import FallbackImage from "@/components/common/FallbackImage";
import { Playlist } from "@/dtos";
import styles from "./PlaylistCard.module.css";

interface PlaylistCardProps {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const ownerName =
    playlist.owner?.displayName || playlist.owner?.username || "Melodix";

  return (
    <Link href={`/playlist/${playlist.id}`} className={styles.card}>
      <div className={styles.coverWrapper}>
        <FallbackImage
          src={playlist.coverUrl || playlist.imageUrl}
          fallbackSrc="/images/default-cover.svg"
          alt={playlist.name}
          width={180}
          height={180}
          className={styles.cover}
        />
        <button className={styles.playButton} aria-label={`Mở playlist ${playlist.name}`}>
          <PlayCircleFilled />
        </button>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{playlist.name}</h3>
        <p className={styles.meta}>Playlist • {ownerName}</p>
      </div>
    </Link>
  );
}

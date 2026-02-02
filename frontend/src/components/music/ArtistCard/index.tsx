"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircleFilled } from "@ant-design/icons";
import { Artist } from "@/types";
import styles from "./ArtistCard.module.css";

interface ArtistCardProps {
  artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const formatListeners = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link href={`/artist/${artist.id}`} className={styles.card}>
      <div className={styles.avatarWrapper}>
        <Image
          src={artist.avatarUrl || "/images/default-artist.jpg"}
          alt={artist.name}
          width={180}
          height={180}
          className={styles.avatar}
        />
        <button className={styles.playButton}>
          <PlayCircleFilled />
        </button>
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{artist.name}</h3>
        <p className={styles.meta}>
          Nghệ sĩ
          {artist.monthlyListeners > 0 && (
            <> • {formatListeners(artist.monthlyListeners)} người nghe</>
          )}
        </p>
      </div>
    </Link>
  );
}

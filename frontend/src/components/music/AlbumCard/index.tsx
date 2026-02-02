"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircleFilled } from "@ant-design/icons";
import { Album } from "@/types";
import styles from "./AlbumCard.module.css";

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const formatYear = (date?: string) => {
    if (!date) return "";
    return new Date(date).getFullYear();
  };

  return (
    <Link href={`/album/${album.id}`} className={styles.card}>
      <div className={styles.coverWrapper}>
        <Image
          src={album.coverUrl || "/images/default-cover.jpg"}
          alt={album.title}
          width={180}
          height={180}
          className={styles.cover}
        />
        <button className={styles.playButton}>
          <PlayCircleFilled />
        </button>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{album.title}</h3>
        <p className={styles.meta}>
          {formatYear(album.releaseDate)}
          {album.artist && (
            <>
              {" • "}
              <span className={styles.artist}>{album.artist.name}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

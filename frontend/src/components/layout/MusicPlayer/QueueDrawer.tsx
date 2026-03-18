"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Drawer, Tooltip } from "antd";
import {
  DeleteOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
} from "@ant-design/icons";
import { Song } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playFromQueue, removeFromQueue, togglePlay } from "@/store/slices/playerSlice";
import styles from "./QueueDrawer.module.css";

interface QueueDrawerProps {
  open: boolean;
  onClose: () => void;
}

const getArtistName = (song: Song) => song.artist?.name || "Unknown Artist";

export default function QueueDrawer({ open, onClose }: QueueDrawerProps) {
  const dispatch = useAppDispatch();
  const { playlist, currentIndex, currentSong, isPlaying } = useAppSelector(
    (state) => state.player,
  );

  const upcomingSongs = playlist.slice(currentIndex + 1);

  return (
    <Drawer
      title={
        <div className={styles.header}>
          <h3 className={styles.title}>Hàng đợi phát</h3>
          <span className={styles.subtitle}>
            {upcomingSongs.length} bài chờ tiếp theo
          </span>
        </div>
      }
      placement="right"
      width={400}
      onClose={onClose}
      open={open}
      styles={{
        body: {
          background: "#121212",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        },
        header: {
          background: "#121212",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        },
      }}
      style={{ background: "#121212" }}
    >
      {currentSong && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Đang phát</h4>
          <div className={styles.currentCard}>
            <Image
              src={
                currentSong.coverUrl ||
                currentSong.album?.coverUrl ||
                "/images/default-cover.jpg"
              }
              alt={currentSong.title}
              width={56}
              height={56}
              className={styles.cover}
            />
            <div className={styles.meta}>
              <Link href={`/song/${currentSong.id}`} className={styles.songTitle}>
                {currentSong.title}
              </Link>
              <span className={styles.artist}>{getArtistName(currentSong)}</span>
            </div>
            <Button
              type="text"
              icon={
                isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />
              }
              onClick={() => dispatch(togglePlay())}
              className={styles.actionButton}
            />
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Tiếp theo</h4>
        {upcomingSongs.length === 0 ? (
          <div className={styles.empty}>Chưa có bài hát nào trong hàng đợi.</div>
        ) : (
          <div className={styles.queueList}>
            {upcomingSongs.map((song, offset) => {
              const index = currentIndex + offset + 1;

              return (
                <div
                  key={`${song.id}-${index}`}
                  className={styles.queueItem}
                >
                  <span className={styles.index}>{offset + 1}</span>
                  <Image
                    src={
                      song.coverUrl ||
                      song.album?.coverUrl ||
                      "/images/default-cover.jpg"
                    }
                    alt={song.title}
                    width={48}
                    height={48}
                    className={styles.cover}
                  />
                  <div className={styles.meta}>
                    <Link href={`/song/${song.id}`} className={styles.songTitle}>
                      {song.title}
                    </Link>
                    <span className={styles.artist}>{getArtistName(song)}</span>
                    {song.album?.title && (
                      <span className={styles.badge}>{song.album.title}</span>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <Tooltip title="Phát ngay">
                      <Button
                        type="text"
                        icon={<PlayCircleFilled />}
                        onClick={() => dispatch(playFromQueue(index))}
                        className={styles.actionButton}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa khỏi hàng đợi">
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => dispatch(removeFromQueue(index))}
                        className={styles.actionButton}
                      />
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Drawer>
  );
}

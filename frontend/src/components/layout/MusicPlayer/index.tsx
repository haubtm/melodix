"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { App, Button, Slider, Tooltip } from "antd";
import {
  ExpandOutlined,
  HeartFilled,
  HeartOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
  RetweetOutlined,
  SoundFilled,
  SoundOutlined,
  StepBackwardFilled,
  StepForwardFilled,
  SwapOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { libraryApi, playbackApi } from "@/api";
import FallbackImage from "@/components/common/FallbackImage";
import { getStreamUrl } from "@/api/songs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  nextTrack,
  previousTrack,
  setProgress,
  setVolume,
  toggleMute,
  togglePlay,
  toggleRepeat,
  toggleShuffle,
} from "@/store/slices/playerSlice";
import QueueDrawer from "./QueueDrawer";
import styles from "./MusicPlayer.module.css";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const router = useRouter();
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordedSongIdRef = useRef<number | null>(null);
  const [likedState, setLikedState] = useState<{ songId: number | null; liked: boolean }>({
    songId: null,
    liked: false,
  });
  const [queueOpen, setQueueOpen] = useState(false);

  const { currentSong, isPlaying, volume, progress, shuffle, repeat, isMuted } =
    useAppSelector((state) => state.player);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    recordedSongIdRef.current = null;
  }, [currentSong?.id]);

  useEffect(() => {
    if (!currentSong || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    const loadLikeStatus = async () => {
      try {
        const result = await libraryApi.getLikedSongStatus(currentSong.id);
        if (isMounted) {
          setLikedState({ songId: currentSong.id, liked: result.liked });
        }
      } catch {
        if (isMounted) {
          setLikedState({ songId: currentSong.id, liked: false });
        }
      }
    };

    void loadLikeStatus();

    return () => {
      isMounted = false;
    };
  }, [currentSong, isAuthenticated]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
      return;
    }

    audioRef.current.pause();
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [isMuted, volume]);

  const emitWindowEvent = (name: string, detail?: unknown) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  };

  const recordPlaySafely = useCallback(async (songId: number, durationMs: number) => {
    try {
      await playbackApi.recordPlay({
        songId,
        durationMs,
      });

      emitWindowEvent("melodix:play-recorded", { songId, durationMs });
    } catch {
      // Ignore playback tracking errors to avoid interrupting audio.
    }
  }, []);

  const handleToggleLike = async () => {
    if (!currentSong) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const currentLiked = likedState.songId === currentSong.id ? likedState.liked : false;
    const nextLiked = !currentLiked;
    setLikedState({ songId: currentSong.id, liked: nextLiked });

    try {
      if (nextLiked) {
        await libraryApi.likeSong(currentSong.id);
      } else {
        await libraryApi.unlikeSong(currentSong.id);
      }

      emitWindowEvent("melodix:library-changed", {
        songId: currentSong.id,
        liked: nextLiked,
      });
    } catch {
      setLikedState({ songId: currentSong.id, liked: currentLiked });
      message.error("Không thể cập nhật thư viện lúc này.");
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    dispatch(setProgress(audioRef.current.currentTime));
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    dispatch(setProgress(value));
  };

  const handleVolumeChange = (value: number) => {
    dispatch(setVolume(value));
  };

  const handleEnded = () => {
    if (
      isAuthenticated &&
      currentSong &&
      recordedSongIdRef.current !== currentSong.id
    ) {
      recordedSongIdRef.current = currentSong.id;
      void recordPlaySafely(currentSong.id, currentSong.durationMs);
    }

    if (repeat === "one" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    dispatch(nextTrack());
  };

  useEffect(() => {
    if (
      !isAuthenticated ||
      !currentSong ||
      progress < 30 ||
      recordedSongIdRef.current === currentSong.id
    ) {
      return;
    }

    recordedSongIdRef.current = currentSong.id;
    void recordPlaySafely(currentSong.id, Math.floor(progress * 1000));
  }, [currentSong, isAuthenticated, progress, recordPlaySafely]);

  if (!currentSong) {
    return (
      <div className={styles.player}>
        <div className={styles.empty}>
          <p>Chọn bài hát để phát nhạc</p>
        </div>
      </div>
    );
  }

  const durationSeconds = currentSong.durationMs / 1000;
  const liked = likedState.songId === currentSong.id ? likedState.liked : false;
  const artistName =
    currentSong.primaryArtist?.name ||
    currentSong.artist?.name ||
    "Unknown Artist";
  const artistId = currentSong.primaryArtist?.id || currentSong.artistId;

  return (
    <div className={styles.player}>
      <audio
        ref={audioRef}
        src={getStreamUrl(currentSong.id)}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className={styles.songInfo}>
        <div className={styles.coverWrapper}>
          <FallbackImage
            src={currentSong.coverUrl || currentSong.album?.coverUrl}
            fallbackSrc="/images/default-cover.svg"
            alt={currentSong.title}
            width={56}
            height={56}
            className={styles.cover}
          />
        </div>
        <div className={styles.songDetails}>
          <Link href={`/song/${currentSong.id}`} className={styles.songTitle}>
            {currentSong.title}
          </Link>
          <Link href={`/artist/${artistId}`} className={styles.artistName}>
            {artistName}
          </Link>
        </div>
        <Button
          type="text"
          icon={liked ? <HeartFilled className={styles.likedIcon} /> : <HeartOutlined />}
          onClick={() => void handleToggleLike()}
          className={styles.likeButton}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.controlButtons}>
          <Tooltip title="Trộn bài">
            <Button
              type="text"
              icon={<SwapOutlined />}
              onClick={() => dispatch(toggleShuffle())}
              className={`${styles.controlButton} ${shuffle ? styles.active : ""}`}
            />
          </Tooltip>
          <Tooltip title="Bài trước">
            <Button
              type="text"
              icon={<StepBackwardFilled />}
              onClick={() => dispatch(previousTrack())}
              className={styles.controlButton}
            />
          </Tooltip>
          <Button
            type="text"
            icon={isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
            onClick={() => dispatch(togglePlay())}
            className={styles.playButton}
          />
          <Tooltip title="Bài tiếp">
            <Button
              type="text"
              icon={<StepForwardFilled />}
              onClick={() => dispatch(nextTrack())}
              className={styles.controlButton}
            />
          </Tooltip>
          <Tooltip
            title={
              repeat === "off"
                ? "Lặp lại"
                : repeat === "all"
                  ? "Lặp lại tất cả"
                  : "Lặp lại một bài"
            }
          >
            <Button
              type="text"
              icon={<RetweetOutlined />}
              onClick={() => dispatch(toggleRepeat())}
              className={`${styles.controlButton} ${repeat !== "off" ? styles.active : ""}`}
            >
              {repeat === "one" && <span className={styles.repeatOne}>1</span>}
            </Button>
          </Tooltip>
        </div>

        <div className={styles.progressBar}>
          <span className={styles.time}>{formatTime(progress)}</span>
          <Slider
            min={0}
            max={durationSeconds}
            value={progress}
            onChange={handleSeek}
            tooltip={{ formatter: (value) => formatTime(value || 0) }}
            className={styles.slider}
          />
          <span className={styles.time}>{formatTime(durationSeconds)}</span>
        </div>
      </div>

      <div className={styles.extraControls}>
        <Tooltip title="Hàng đợi">
          <Button
            type="text"
            icon={<UnorderedListOutlined />}
            className={styles.extraButton}
            onClick={() => setQueueOpen(true)}
          />
        </Tooltip>
        <div className={styles.volumeControl}>
          <Button
            type="text"
            icon={isMuted || volume === 0 ? <SoundOutlined /> : <SoundFilled />}
            onClick={() => dispatch(toggleMute())}
            className={styles.extraButton}
          />
          <Slider
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
        </div>
        <Tooltip title="Toàn màn hình">
          <Button
            type="text"
            icon={<ExpandOutlined />}
            className={styles.extraButton}
          />
        </Tooltip>
      </div>

      <QueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} />
    </div>
  );
}

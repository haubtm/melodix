"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Slider, Button, Tooltip } from "antd";
import {
  PlayCircleFilled,
  PauseCircleFilled,
  StepBackwardFilled,
  StepForwardFilled,
  RetweetOutlined,
  SwapOutlined,
  SoundOutlined,
  SoundFilled,
  HeartOutlined,
  HeartFilled,
  UnorderedListOutlined,
  ExpandOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  togglePlay,
  nextTrack,
  previousTrack,
  setProgress,
  setVolume,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
} from "@/store/slices/playerSlice";
import styles from "./MusicPlayer.module.css";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const dispatch = useAppDispatch();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [liked, setLiked] = useState(false);

  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    shuffle,
    repeat,
    isMuted,
  } = useAppSelector((state) => state.player);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setProgress(audioRef.current.currentTime));
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      dispatch(setProgress(value));
    }
  };

  const handleVolumeChange = (value: number) => {
    dispatch(setVolume(value));
  };

  const handleEnded = () => {
    if (repeat === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      dispatch(nextTrack());
    }
  };

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

  return (
    <div className={styles.player}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Song Info */}
      <div className={styles.songInfo}>
        <div className={styles.coverWrapper}>
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
        </div>
        <div className={styles.songDetails}>
          <Link href={`/song/${currentSong.id}`} className={styles.songTitle}>
            {currentSong.title}
          </Link>
          <Link
            href={`/artist/${currentSong.artistId}`}
            className={styles.artistName}
          >
            {currentSong.artist?.name || "Unknown Artist"}
          </Link>
        </div>
        <Button
          type="text"
          icon={
            liked ? (
              <HeartFilled className={styles.likedIcon} />
            ) : (
              <HeartOutlined />
            )
          }
          onClick={() => setLiked(!liked)}
          className={styles.likeButton}
        />
      </div>

      {/* Controls */}
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

      {/* Extra Controls */}
      <div className={styles.extraControls}>
        <Tooltip title="Hàng đợi">
          <Button
            type="text"
            icon={<UnorderedListOutlined />}
            className={styles.extraButton}
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
    </div>
  );
}

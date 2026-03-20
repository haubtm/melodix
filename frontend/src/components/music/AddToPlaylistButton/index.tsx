"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { App, Button, Empty, Modal, Radio, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { playlistsApi } from "@/api";
import { Playlist } from "@/dtos";
import { useAppSelector } from "@/store/hooks";

interface AddToPlaylistButtonProps {
  songId: number;
  songTitle?: string;
  buttonText?: string;
  className?: string;
  type?: "text" | "default" | "primary";
}

export default function AddToPlaylistButton({
  songId,
  songTitle,
  buttonText,
  className,
  type = "text",
}: AddToPlaylistButtonProps) {
  const { message } = App.useApp();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    const loadPlaylists = async () => {
      setLoading(true);

      try {
        const response = await playlistsApi.getMine(1, 100);
        if (!isMounted) {
          return;
        }

        const items = response.data || [];
        setPlaylists(items);
        setSelectedPlaylistId(items[0]?.id ?? null);
      } catch {
        if (!isMounted) {
          return;
        }

        setPlaylists([]);
        setSelectedPlaylistId(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPlaylists();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, open]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async () => {
    if (!selectedPlaylistId) {
      return;
    }

    setSubmitting(true);

    try {
      await playlistsApi.addSongs(selectedPlaylistId, [songId]);
      window.dispatchEvent(
        new CustomEvent("melodix:playlist-changed", {
          detail: { playlistId: selectedPlaylistId, songId },
        }),
      );
      message.success(
        songTitle
          ? `Đã thêm "${songTitle}" vào playlist.`
          : "Đã thêm bài hát vào playlist.",
      );
      setOpen(false);
    } catch {
      message.error("Không thể thêm bài hát vào playlist.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type={type}
        icon={<PlusOutlined />}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {buttonText}
      </Button>

      <Modal
        title="Thêm vào playlist"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okText="Thêm"
        confirmLoading={submitting}
        okButtonProps={{ disabled: !selectedPlaylistId }}
      >
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
            <Spin />
          </div>
        ) : playlists.length ? (
          <Radio.Group
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
            value={selectedPlaylistId ?? undefined}
            onChange={(event) => setSelectedPlaylistId(event.target.value)}
          >
            {playlists.map((playlist) => (
              <Radio key={playlist.id} value={playlist.id}>
                {playlist.name} ({playlist.totalTracks} bài hát)
              </Radio>
            ))}
          </Radio.Group>
        ) : (
          <Empty
            description={
              <>
                Bạn chưa có playlist nào.{" "}
                <Link href="/">Tạo playlist từ thanh bên trước.</Link>
              </>
            }
          />
        )}
      </Modal>
    </>
  );
}

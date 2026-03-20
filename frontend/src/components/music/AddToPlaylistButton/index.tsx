"use client";

import { useEffect, useState } from "react";
import { App, Button, Divider, Empty, Form, Input, Modal, Radio, Spin, Switch } from "antd";
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
  const [createMode, setCreateMode] = useState(false);
  const [form] = Form.useForm();

  const loadPlaylists = async () => {
    setLoading(true);

    try {
      const response = await playlistsApi.getMine(1, 100);
      const items = response.data || [];
      setPlaylists(items);
      setSelectedPlaylistId((current) => current ?? items[0]?.id ?? null);
    } catch {
      setPlaylists([]);
      setSelectedPlaylistId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !isAuthenticated) {
      return;
    }

    void loadPlaylists();
  }, [isAuthenticated, open]);

  if (!isAuthenticated) {
    return null;
  }

  const handleAddToExistingPlaylist = async () => {
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

  const handleCreatePlaylist = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const playlist = await playlistsApi.create(values);
      await playlistsApi.addSongs(playlist.id, [songId]);
      window.dispatchEvent(
        new CustomEvent("melodix:playlist-changed", {
          detail: { playlistId: playlist.id, songId },
        }),
      );
      message.success(
        songTitle
          ? `Đã tạo playlist và thêm "${songTitle}".`
          : "Đã tạo playlist và thêm bài hát.",
      );
      form.resetFields();
      setCreateMode(false);
      setOpen(false);
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        return;
      }

      message.error("Không thể tạo playlist lúc này.");
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
          setCreateMode(false);
          setOpen(true);
        }}
      >
        {buttonText}
      </Button>

      <Modal
        title="Thêm vào playlist"
        open={open}
        onCancel={() => {
          setOpen(false);
          setCreateMode(false);
          form.resetFields();
        }}
        onOk={() =>
          void (createMode ? handleCreatePlaylist() : handleAddToExistingPlaylist())
        }
        okText={createMode ? "Tạo playlist" : "Thêm"}
        confirmLoading={submitting}
        okButtonProps={{ disabled: createMode ? false : !selectedPlaylistId }}
      >
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
            <Spin />
          </div>
        ) : (
          <>
            {playlists.length ? (
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
              <Empty description="Bạn chưa có playlist nào." />
            )}

            <Divider style={{ margin: "20px 0 16px" }} />

            {!createMode ? (
              <Button
                block
                icon={<PlusOutlined />}
                onClick={() => {
                  form.setFieldsValue({ isPublic: false });
                  setCreateMode(true);
                }}
              >
                Tạo playlist mới ngay tại đây
              </Button>
            ) : (
              <Form
                form={form}
                layout="vertical"
                initialValues={{ isPublic: false }}
              >
                <Form.Item
                  name="name"
                  label="Tên playlist"
                  rules={[{ required: true, message: "Nhập tên playlist" }]}
                >
                  <Input placeholder="Ví dụ: Chill đêm muộn" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea rows={3} placeholder="Mô tả ngắn về playlist" />
                </Form.Item>

                <Form.Item name="imageUrl" label="Ảnh bìa">
                  <Input placeholder="https://..." />
                </Form.Item>

                <Form.Item name="isPublic" label="Công khai" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Button block onClick={() => setCreateMode(false)}>
                  Quay lại chọn playlist
                </Button>
              </Form>
            )}
          </>
        )}
      </Modal>
    </>
  );
}

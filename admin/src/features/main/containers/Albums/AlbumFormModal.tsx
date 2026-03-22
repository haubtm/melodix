"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Switch,
  Typography,
  Upload,
  message,
} from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { PictureOutlined, UndoOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Form as CommonFormModal } from "@/lib";
import {
  AlbumType,
  IAlbumCreateRequest,
  IAlbumResponseData,
  IAlbumUpdateRequest,
} from "@/dtos/albums";
import { IArtistSelectItem } from "@/dtos/artists";
import { Song } from "@/dtos/songs";
import {
  useAlbumDetail,
  useArtistsForSelect,
  useUploadFile,
} from "../../react-query";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const albumTypeOptions: { label: string; value: AlbumType }[] = [
  { label: "Album", value: "album" },
  { label: "Single", value: "single" },
  { label: "EP", value: "ep" },
  { label: "Compilation", value: "compilation" },
];

const sectionStyle: React.CSSProperties = {
  padding: 12,
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.015)",
};

const songRowBaseStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.025)",
  transition:
    "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
};

interface AlbumFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (
    values: IAlbumCreateRequest | IAlbumUpdateRequest,
    options?: { orderedSongs?: Array<Pick<Song, "id" | "trackNumber">> },
  ) => void | Promise<void>;
  initialValues?: IAlbumResponseData | null;
  loading?: boolean;
}

function sortSongsForAlbum(songs: Song[]): Song[] {
  return [...songs].sort((a, b) => {
    const aTrack = a.trackNumber ?? Number.MAX_SAFE_INTEGER;
    const bTrack = b.trackNumber ?? Number.MAX_SAFE_INTEGER;
    if (aTrack !== bTrack) {
      return aTrack - bTrack;
    }

    return a.id - b.id;
  });
}

function createInitialFileList(url: string | null | undefined): UploadFile[] {
  if (!url) {
    return [];
  }

  return [
    {
      uid: "album-cover",
      name: "album-cover",
      status: "done",
      url,
    },
  ];
}

function SongRowContent({ song, index }: { song: Song; index: number }) {
  return (
    <>
      <Typography.Text
        strong
        style={{
          minWidth: 28,
          textAlign: "center",
          marginBottom: 0,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Typography.Text>

      <Avatar
        src={song.coverUrl || undefined}
        shape="square"
        size={42}
        icon={!song.coverUrl ? <PictureOutlined /> : undefined}
        style={{ flexShrink: 0 }}
      />

      <div style={{ minWidth: 0, flex: 1 }}>
        <Typography.Text
          strong
          style={{
            display: "block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.title}
        </Typography.Text>
      </div>
    </>
  );
}

function SortableSongItem({
  song,
  index,
  isDropTarget,
}: {
  song: Song;
  index: number;
  isDropTarget: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...songRowBaseStyle,
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 2 : 1,
        opacity: isDragging ? 0.45 : 1,
        borderColor: isDropTarget
          ? "rgba(22, 119, 255, 0.65)"
          : "rgba(255,255,255,0.06)",
        background: isDropTarget
          ? "rgba(22, 119, 255, 0.10)"
          : "rgba(255,255,255,0.025)",
        boxShadow: isDropTarget
          ? "0 0 0 1px rgba(22,119,255,0.12) inset"
          : "none",
      }}
      {...attributes}
      {...listeners}
    >
      <SongRowContent song={song} index={index} />
    </div>
  );
}

export function AlbumFormModal({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}: AlbumFormModalProps) {
  const [form] = Form.useForm();
  const [artistSearchText, setArtistSearchText] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | undefined>(
    initialValues?.coverUrl || undefined,
  );
  const [coverFileList, setCoverFileList] = useState<UploadFile[]>([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [orderedSongs, setOrderedSongs] = useState<Song[]>([]);
  const [activeSongId, setActiveSongId] = useState<number | null>(null);
  const [overSongId, setOverSongId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
  );

  const { data: artistsData, isLoading: artistsLoading } = useArtistsForSelect({
    page: 1,
    limit: 50,
    search: artistSearchText
      ? { fields: ["name", "slug"], data: artistSearchText }
      : undefined,
  });
  const { data: albumDetailData, isLoading: albumDetailLoading } =
    useAlbumDetail(visible && initialValues?.id ? initialValues.id : 0);
  const { mutateAsync: uploadFile } = useUploadFile();

  const artistOptions = useMemo(() => {
    return (
      artistsData?.data?.map((artist: IArtistSelectItem) => ({
        label: artist.name,
        value: artist.id,
      })) || []
    );
  }, [artistsData]);

  const originalOrderedSongs = useMemo(
    () => sortSongsForAlbum(albumDetailData?.data?.songs || []),
    [albumDetailData],
  );

  const activeSong = useMemo(
    () => orderedSongs.find((song) => song.id === activeSongId) || null,
    [activeSongId, orderedSongs],
  );

  const getBase64 = (file: FileType) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage((file.url || file.preview) as string);
    setPreviewOpen(true);
    setPreviewTitle(file.name || "Preview");
  };

  const beforeUpload = (file: FileType) => {
    const isUnder1MB = file.size / 1024 / 1024 < 1;

    if (!isUnder1MB) {
      message.error("Ảnh bìa phải nhỏ hơn 1MB");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const nextOverId = event.over?.id;
    setOverSongId(typeof nextOverId === "number" ? nextOverId : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSongId(null);
    setOverSongId(null);

    if (!over || active.id === over.id) {
      return;
    }

    setOrderedSongs((currentSongs) => {
      const oldIndex = currentSongs.findIndex((song) => song.id === active.id);
      const newIndex = currentSongs.findIndex((song) => song.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        return currentSongs;
      }

      return arrayMove(currentSongs, oldIndex, newIndex);
    });
  };

  const formItems = initialValues?.id ? (
    <Row gutter={[16, 8]} align="top">
      <Col xs={24} xl={14}>
        <Row gutter={[16, 8]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="artistId"
              label="Nghệ sĩ"
              rules={[{ required: true, message: "Vui lòng chọn nghệ sĩ" }]}
            >
              <Select
                showSearch
                placeholder="Tìm và chọn nghệ sĩ..."
                filterOption={false}
                onSearch={setArtistSearchText}
                options={artistOptions}
                loading={artistsLoading}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="title"
              label="Tên album"
              rules={[{ required: true, message: "Vui lòng nhập tên album" }]}
            >
              <Input placeholder="Nhập tên album" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="slug"
              label="Slug"
              rules={[
                {
                  pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: "Slug phải là kebab-case (vd: ten-album)",
                },
              ]}
            >
              <Input placeholder="Tự động tạo nếu để trống" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="albumType" label="Loại album" initialValue="album">
              <Select options={albumTypeOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="releaseDate" label="Ngày phát hành">
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="isPublished"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Đã xuất bản"
                unCheckedChildren="Bản nháp"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={14}>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={9} placeholder="Nhập mô tả album..." />
            </Form.Item>
          </Col>

          <Col xs={24} md={10}>
            <div style={{ ...sectionStyle, height: "100%" }}>
              <Typography.Text strong>Ảnh bìa album</Typography.Text>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Upload
                  accept="image/*"
                  listType="picture-card"
                  fileList={coverFileList}
                  maxCount={1}
                  beforeUpload={beforeUpload}
                  onPreview={handlePreview}
                  onChange={({ fileList }) => {
                    setCoverFileList(fileList);
                    const currentFile = fileList[0];
                    if (!currentFile) {
                      setCoverUrl(undefined);
                    } else if (currentFile.url) {
                      setCoverUrl(currentFile.url);
                    }
                  }}
                >
                  {coverFileList.length >= 1 ? null : "Tải ảnh"}
                </Upload>
              </div>
            </div>
          </Col>
        </Row>
      </Col>

      <Col xs={24} xl={10}>
        <div style={{ ...sectionStyle, height: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <Typography.Text strong>Thứ tự bài hát trong album</Typography.Text>
            <Button
              icon={<UndoOutlined />}
              onClick={() => setOrderedSongs(originalOrderedSongs)}
            >
              Khôi phục
            </Button>
          </div>

          {albumDetailLoading ? (
            <Typography.Text type="secondary">
              Đang tải danh sách bài hát...
            </Typography.Text>
          ) : orderedSongs.length ? (
            <div style={{ maxHeight: 540, overflowY: "auto", paddingRight: 4 }}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(event) => {
                  setActiveSongId(Number(event.active.id));
                  setOverSongId(Number(event.active.id));
                }}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={() => {
                  setActiveSongId(null);
                  setOverSongId(null);
                }}
                autoScroll={{
                  acceleration: 14,
                  threshold: { x: 0.1, y: 0.18 },
                }}
              >
                <SortableContext
                  items={orderedSongs.map((song) => song.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{ display: "grid", gap: 10 }}>
                    {orderedSongs.map((song, index) => (
                      <SortableSongItem
                        key={song.id}
                        song={song}
                        index={index}
                        isDropTarget={
                          activeSongId !== null &&
                          overSongId === song.id &&
                          activeSongId !== song.id
                        }
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay
                  dropAnimation={{ duration: 180, easing: "ease-out" }}
                >
                  {activeSong ? (
                    <div
                      style={{
                        ...songRowBaseStyle,
                        width: 320,
                        boxShadow: "0 18px 42px rgba(0, 0, 0, 0.35)",
                        borderColor: "rgba(22, 119, 255, 0.8)",
                        background: "rgba(22, 119, 255, 0.14)",
                        cursor: "grabbing",
                      }}
                    >
                      <SongRowContent
                        song={activeSong}
                        index={orderedSongs.findIndex(
                          (item) => item.id === activeSong.id,
                        )}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          ) : (
            <Typography.Text type="secondary">
              Album này chưa có bài hát nào để sắp xếp.
            </Typography.Text>
          )}
        </div>
      </Col>
    </Row>
  ) : (
    <Row gutter={[16, 8]}>
      <Col xs={24} md={12}>
        <Form.Item
          name="artistId"
          label="Nghệ sĩ"
          rules={[{ required: true, message: "Vui lòng chọn nghệ sĩ" }]}
        >
          <Select
            showSearch
            placeholder="Tìm và chọn nghệ sĩ..."
            filterOption={false}
            onSearch={setArtistSearchText}
            options={artistOptions}
            loading={artistsLoading}
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="title"
          label="Tên album"
          rules={[{ required: true, message: "Vui lòng nhập tên album" }]}
        >
          <Input placeholder="Nhập tên album" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            {
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: "Slug phải là kebab-case (vd: ten-album)",
            },
          ]}
        >
          <Input placeholder="Tự động tạo nếu để trống" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item name="albumType" label="Loại album" initialValue="album">
          <Select options={albumTypeOptions} />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item name="releaseDate" label="Ngày phát hành">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="isPublished"
          label="Trạng thái"
          valuePropName="checked"
        >
          <Switch checkedChildren="Đã xuất bản" unCheckedChildren="Bản nháp" />
        </Form.Item>
      </Col>

      <Col xs={24} md={16}>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={8} placeholder="Nhập mô tả album..." />
        </Form.Item>
      </Col>

      <Col xs={24} md={8}>
        <div style={{ ...sectionStyle, height: "100%" }}>
          <Typography.Text strong>Ảnh bìa album</Typography.Text>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Upload
              accept="image/*"
              listType="picture-card"
              fileList={coverFileList}
              maxCount={1}
              beforeUpload={beforeUpload}
              onPreview={handlePreview}
              onChange={({ fileList }) => {
                setCoverFileList(fileList);
                const currentFile = fileList[0];
                if (!currentFile) {
                  setCoverUrl(undefined);
                } else if (currentFile.url) {
                  setCoverUrl(currentFile.url);
                }
              }}
            >
              {coverFileList.length >= 1 ? null : "Tải ảnh"}
            </Upload>
          </div>
        </div>
      </Col>
    </Row>
  );

  const formattedInitialValues = initialValues
    ? {
        ...initialValues,
        releaseDate: initialValues.releaseDate
          ? dayjs(initialValues.releaseDate)
          : undefined,
      }
    : undefined;

  const handleSubmit = async (values: Record<string, unknown>) => {
    let nextCoverUrl = coverUrl;

    try {
      const coverOriginFile = coverFileList[0]?.originFileObj as
        | File
        | undefined;

      if (coverOriginFile) {
        setCoverUploading(true);
        const result = await uploadFile({
          file: coverOriginFile,
          folder: "albums",
        });
        nextCoverUrl = result.url;
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải ảnh bìa");
      console.error(error);
      setCoverUploading(false);
      return;
    }

    try {
      await onSubmit(
        {
          artistId: values.artistId as number,
          title: values.title as string,
          slug: values.slug as string | undefined,
          description: values.description as string | undefined,
          coverUrl: nextCoverUrl,
          releaseDate: values.releaseDate
            ? (values.releaseDate as dayjs.Dayjs).format("YYYY-MM-DD")
            : undefined,
          albumType: values.albumType as AlbumType,
          isPublished: values.isPublished as boolean | undefined,
        },
        {
          orderedSongs: orderedSongs.map((song, index) => ({
            id: song.id,
            trackNumber: index + 1,
          })),
        },
      );
    } finally {
      setCoverUploading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      const nextCoverUrl = initialValues?.coverUrl || undefined;
      setCoverUrl(nextCoverUrl);
      setCoverFileList(createInitialFileList(nextCoverUrl));
      setArtistSearchText("");
    }
  }, [visible, initialValues]);

  useEffect(() => {
    const songs = albumDetailData?.data?.songs;
    if (visible && songs) {
      setOrderedSongs(sortSongsForAlbum(songs));
    } else if (!visible) {
      setOrderedSongs([]);
      setActiveSongId(null);
      setOverSongId(null);
    }
  }, [albumDetailData, visible]);

  return (
    <>
      <CommonFormModal
        visible={visible}
        title={initialValues ? "Chỉnh sửa album" : "Thêm album"}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        initialValues={formattedInitialValues}
        loading={loading || coverUploading}
        formItems={formItems}
        form={form}
        width={1040}
        top={16}
      />

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image
          alt={previewTitle}
          style={{ width: "100%" }}
          src={previewImage}
        />
      </Modal>
    </>
  );
}

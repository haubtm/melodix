"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Typography,
  Upload,
  message,
} from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import {
  CreateSongRequest,
  IAlbumSelectItem,
  IArtistSelectItem,
  IGenreSelectItem,
  Song,
  UpdateSongRequest,
} from "@/dtos";
import { Form as CommonFormModal } from "@/lib";
import {
  useAlbumsForSelect,
  useArtistsForSelect,
  useGenresForSelect,
  useUploadFile,
} from "../../react-query";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const uploadPanelStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 220,
  padding: 16,
  border: "1px dashed rgba(255,255,255,0.16)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.02)",
};

const uploadCardContentStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  textAlign: "center",
};

interface SongFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (
    values: CreateSongRequest | UpdateSongRequest,
  ) => Promise<void> | void;
  initialValues?: Song | null;
  loading?: boolean;
}

function createInitialFileList(
  url: string | null | undefined,
  key: string,
): UploadFile[] {
  if (!url) {
    return [];
  }

  return [
    {
      uid: key,
      name: key,
      status: "done",
      url,
    },
  ];
}

function UploadCard({
  title,
  description,
  fileName,
  children,
}: {
  title: string;
  description: string;
  fileName?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={uploadPanelStyle}>
      <div style={uploadCardContentStyle}>
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {description}
          </div>
        </div>
        {children}
        <div
          style={{
            minHeight: 20,
            fontSize: 13,
            color: "rgba(255,255,255,0.75)",
            wordBreak: "break-word",
          }}
        >
          {fileName || ""}
        </div>
      </div>
    </div>
  );
}

export function SongFormModal({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}: SongFormModalProps) {
  const [form] = Form.useForm();
  const [artistSearchText, setArtistSearchText] = useState("");
  const [albumSearchText, setAlbumSearchText] = useState("");
  const [genreSearchText, setGenreSearchText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | undefined>(
    initialValues?.audioUrl || undefined,
  );
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | undefined>(
    initialValues?.audioUrl || undefined,
  );
  const [coverUrl, setCoverUrl] = useState<string | undefined>(
    initialValues?.coverUrl || undefined,
  );
  const [lyricsUrl, setLyricsUrl] = useState<string | undefined>(
    initialValues?.lyricsUrl || undefined,
  );
  const [audioFileList, setAudioFileList] = useState<UploadFile[]>([]);
  const [coverFileList, setCoverFileList] = useState<UploadFile[]>([]);
  const [lyricsFileList, setLyricsFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const { data: artistsData, isLoading: artistsLoading } = useArtistsForSelect({
    page: 1,
    limit: 50,
    search: artistSearchText
      ? { fields: ["name", "slug"], data: artistSearchText }
      : undefined,
  });
  const { data: albumsData, isLoading: albumsLoading } = useAlbumsForSelect({
    page: 1,
    limit: 50,
    search: albumSearchText
      ? { fields: ["title"], data: albumSearchText }
      : undefined,
  });
  const { data: genresData, isLoading: genresLoading } = useGenresForSelect({
    page: 1,
    limit: 50,
    search: genreSearchText
      ? { fields: ["name", "description"], data: genreSearchText }
      : undefined,
  });
  const { mutateAsync: uploadFile } = useUploadFile();

  const artistOptions = useMemo(
    () =>
      artistsData?.data?.map((artist: IArtistSelectItem) => ({
        label: artist.name,
        value: artist.id,
      })) || [],
    [artistsData],
  );

  const albumOptions = useMemo(
    () =>
      albumsData?.data?.map((album: IAlbumSelectItem) => ({
        label: album.title,
        value: album.id,
      })) || [],
    [albumsData],
  );

  const genreOptions = useMemo(
    () =>
      genresData?.data?.map((genre: IGenreSelectItem) => ({
        label: genre.name,
        value: genre.id,
      })) || [],
    [genresData],
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

  const handleAudioChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setAudioFileList(fileList);
    const currentFile = fileList[0];

    setAudioPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }

      if (!currentFile) {
        return undefined;
      }

      if (currentFile.originFileObj) {
        return URL.createObjectURL(currentFile.originFileObj as File);
      }

      return currentFile.url;
    });

    if (!currentFile) {
      setAudioUrl(undefined);
    } else if (currentFile.url) {
      setAudioUrl(currentFile.url);
    }
  };

  const handleDeferredUpload =
    (
      setter: React.Dispatch<React.SetStateAction<UploadFile[]>>,
      urlSetter: React.Dispatch<React.SetStateAction<string | undefined>>,
    ) =>
    ({ fileList }: { fileList: UploadFile[] }) => {
      setter(fileList);
      const currentFile = fileList[0];
      if (!currentFile) {
        urlSetter(undefined);
      } else if (currentFile.url) {
        urlSetter(currentFile.url);
      }
    };

  const uploadDeferredFile = async (
    fileList: UploadFile[],
    folder: string,
    fallbackUrl?: string,
  ) => {
    const originFile = fileList[0]?.originFileObj as File | undefined;

    if (!originFile) {
      return fallbackUrl;
    }

    const result = await uploadFile({ file: originFile, folder });
    return result.url;
  };

  const formItems = (
    <Row gutter={[16, 8]}>
      <Col xs={24} md={12}>
        <Form.Item
          name="artistId"
          label="Nghệ sĩ chính"
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
          label="Tên bài hát"
          rules={[{ required: true, message: "Vui lòng nhập tên bài hát" }]}
        >
          <Input placeholder="Nhập tên bài hát" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item name="albumId" label="Album">
          <Select
            showSearch
            allowClear
            placeholder="Tìm và chọn album..."
            filterOption={false}
            onSearch={setAlbumSearchText}
            options={albumOptions}
            loading={albumsLoading}
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="durationMs"
          label="Thời lượng (ms)"
          rules={[{ required: true, message: "Vui lòng nhập thời lượng" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item name="genreIds" label="Thể loại">
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="Chọn thể loại..."
            filterOption={false}
            onSearch={setGenreSearchText}
            options={genreOptions}
            loading={genresLoading}
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item name="featuredArtistIds" label="Nghệ sĩ góp mặt">
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="Chọn nghệ sĩ feat..."
            filterOption={false}
            onSearch={setArtistSearchText}
            options={artistOptions}
            loading={artistsLoading}
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={8}>
        <Typography.Text strong>Audio</Typography.Text>
        <Upload
          accept="audio/*"
          fileList={audioFileList}
          maxCount={1}
          beforeUpload={() => false}
          onChange={handleAudioChange}
          showUploadList={false}
          style={{ width: "100%", display: "block", marginTop: 8 }}
        >
          <UploadCard
            title="Tải file audio"
            description="Chọn file âm thanh để xem trước trước khi lưu"
            fileName={audioFileList[0]?.name}
          >
            {audioPreviewUrl ? (
              <audio controls style={{ width: "100%" }}>
                <source src={audioPreviewUrl} />
              </audio>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 84,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                }}
              >
                Chưa chọn file audio
              </div>
            )}
          </UploadCard>
        </Upload>
      </Col>

      <Col xs={24} md={8}>
        <Typography.Text strong>Ảnh bìa</Typography.Text>
        <Upload
          accept="image/*"
          fileList={coverFileList}
          maxCount={1}
          beforeUpload={() => false}
          onPreview={handlePreview}
          onChange={handleDeferredUpload(setCoverFileList, setCoverUrl)}
          showUploadList={false}
          style={{ width: "100%", display: "block", marginTop: 8 }}
        >
          <UploadCard
            title="Tải ảnh bìa"
            description="Chọn ảnh bìa để xem trước trước khi lưu"
            fileName={coverFileList[0]?.name}
          >
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt="cover preview"
                preview={false}
                width="100%"
                height={84}
                style={{
                  objectFit: "cover",
                  borderRadius: 10,
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 84,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                }}
              >
                Chưa chọn ảnh bìa
              </div>
            )}
          </UploadCard>
        </Upload>
      </Col>

      <Col xs={24} md={8}>
        <Typography.Text strong>Lời bài hát</Typography.Text>
        <Upload
          accept=".lrc,.txt"
          fileList={lyricsFileList}
          maxCount={1}
          beforeUpload={() => false}
          onChange={handleDeferredUpload(setLyricsFileList, setLyricsUrl)}
          showUploadList={false}
          style={{ width: "100%", display: "block", marginTop: 8 }}
        >
          <UploadCard
            title="Tải file lời bài hát"
            description="Hỗ trợ file `.lrc` hoặc `.txt`"
            fileName={lyricsFileList[0]?.name}
          >
            <div
              style={{
                width: "100%",
                height: 84,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.35)",
                fontSize: 13,
                padding: "0 12px",
              }}
            >
              {lyricsFileList[0]?.name || "Chưa chọn file lời bài hát"}
            </div>
          </UploadCard>
        </Upload>
      </Col>
    </Row>
  );

  const formattedInitialValues = initialValues
    ? {
        ...initialValues,
        artistId: initialValues.primaryArtist?.id,
        genreIds: initialValues.genres?.map((item) => item.genre.id) || [],
        featuredArtistIds:
          initialValues.songArtists?.map((item) => item.artist.id) || [],
      }
    : undefined;

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setIsUploading(true);
      const normalizedAlbumId =
        typeof values.albumId === "number" ? values.albumId : undefined;
      const normalizedGenreIds = Array.isArray(values.genreIds)
        ? (values.genreIds as number[])
        : undefined;
      const normalizedFeaturedArtistIds = Array.isArray(
        values.featuredArtistIds,
      )
        ? (values.featuredArtistIds as number[])
        : undefined;

      const nextAudioUrl = await uploadDeferredFile(
        audioFileList,
        "songs/audio",
        audioUrl,
      );
      const nextCoverUrl = await uploadDeferredFile(
        coverFileList,
        "songs/covers",
        coverUrl,
      );
      const nextLyricsUrl = await uploadDeferredFile(
        lyricsFileList,
        "songs/lyrics",
        lyricsUrl,
      );

      if (!nextAudioUrl) {
        message.error("Vui lòng cung cấp file audio");
        return;
      }

      await onSubmit({
        title: values.title as string,
        artistId: values.artistId as number,
        albumId: normalizedAlbumId,
        durationMs: values.durationMs as number,
        audioUrl: nextAudioUrl,
        coverUrl: nextCoverUrl,
        lyricsUrl: nextLyricsUrl,
        genreIds: normalizedGenreIds,
        featuredArtistIds: normalizedFeaturedArtistIds,
      });
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải tệp bài hát");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setArtistSearchText("");
      setAlbumSearchText("");
      setGenreSearchText("");
      setAudioUrl(initialValues?.audioUrl || undefined);
      setAudioPreviewUrl(initialValues?.audioUrl || undefined);
      setCoverUrl(initialValues?.coverUrl || undefined);
      setLyricsUrl(initialValues?.lyricsUrl || undefined);
      setAudioFileList(createInitialFileList(initialValues?.audioUrl, "audio"));
      setCoverFileList(createInitialFileList(initialValues?.coverUrl, "cover"));
      setLyricsFileList(
        createInitialFileList(initialValues?.lyricsUrl, "lyrics"),
      );
    }
  }, [visible, initialValues]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl && audioPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  return (
    <>
      <CommonFormModal
        visible={visible}
        title={initialValues ? "Chỉnh sửa bài hát" : "Thêm bài hát"}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        initialValues={formattedInitialValues}
        loading={loading || isUploading}
        formItems={formItems}
        form={form}
        width={920}
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

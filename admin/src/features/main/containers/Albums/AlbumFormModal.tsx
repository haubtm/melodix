"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
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
import dayjs from "dayjs";
import { Form as CommonFormModal } from "@/lib";
import {
  AlbumType,
  IAlbumCreateRequest,
  IAlbumResponseData,
  IAlbumUpdateRequest,
} from "@/dtos/albums";
import { IArtistSelectItem } from "@/dtos/artists";
import { useArtistsForSelect, useUploadFile } from "../../react-query";

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
  minHeight: 210,
};

interface AlbumFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (
    values: IAlbumCreateRequest | IAlbumUpdateRequest,
  ) => void | Promise<void>;
  initialValues?: IAlbumResponseData | null;
  loading?: boolean;
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

  const { data: artistsData, isLoading: artistsLoading } = useArtistsForSelect({
    page: 1,
    limit: 50,
    search: artistSearchText
      ? { fields: ["name", "slug"], data: artistSearchText }
      : undefined,
  });
  const { mutateAsync: uploadFile } = useUploadFile();

  const artistOptions = useMemo(() => {
    return (
      artistsData?.data?.map((artist: IArtistSelectItem) => ({
        label: artist.name,
        value: artist.id,
      })) || []
    );
  }, [artistsData]);

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

  const formItems = (
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
      await onSubmit({
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
      });
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
        width={780}
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

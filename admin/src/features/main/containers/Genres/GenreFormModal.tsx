"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Upload, message, ColorPicker, Image } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { Form as CommonFormModal } from "@/lib";
import {
  IGenreCreateRequest,
  IGenreResponseData,
  IGenreUpdateRequest,
} from "@/dtos/genres";
import { useUploadGenreImage } from "../../react-query";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface GenreFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (
    values: IGenreCreateRequest | IGenreUpdateRequest,
  ) => void | Promise<void>;
  initialValues?: IGenreResponseData | null;
  loading?: boolean;
}

function createInitialFileList(url: string | null | undefined): UploadFile[] {
  if (!url) {
    return [];
  }

  return [
    {
      uid: "genre-image",
      name: "genre-image",
      status: "done",
      url,
    },
  ];
}

export function GenreFormModal({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}: GenreFormModalProps) {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    initialValues?.imageUrl || undefined,
  );
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const { mutateAsync: uploadGenreImage } = useUploadGenreImage();

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
      message.error("Ảnh thể loại phải nhỏ hơn 1MB");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const formItems = (
    <>
      <Form.Item
        name="name"
        label="Tên thể loại"
        rules={[{ required: true, message: "Vui lòng nhập tên thể loại" }]}
      >
        <Input placeholder="Nhập tên thể loại" />
      </Form.Item>

      <Form.Item
        name="slug"
        label="Slug"
        rules={[
          {
            pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            message: "Slug phải là kebab-case (vd: nhac-tre)",
          },
        ]}
      >
        <Input placeholder="Tự động tạo nếu để trống" />
      </Form.Item>

      <Form.Item name="description" label="Mô tả">
        <Input.TextArea rows={4} placeholder="Nhập mô tả thể loại..." />
      </Form.Item>

      <Form.Item name="color" label="Màu đại diện">
        <ColorPicker
          format="hex"
          showText
          onChange={(value) => {
            form.setFieldValue("color", value.toHexString());
          }}
        />
      </Form.Item>

      <Form.Item label="Ảnh thể loại">
        <Upload
          accept="image/*"
          listType="picture-card"
          fileList={imageFileList}
          maxCount={1}
          beforeUpload={beforeUpload}
          onPreview={handlePreview}
          onChange={({ fileList }) => {
            setImageFileList(fileList);
            const currentFile = fileList[0];
            if (!currentFile) {
              setImageUrl(undefined);
            } else if (currentFile.url) {
              setImageUrl(currentFile.url);
            }
          }}
        >
          {imageFileList.length >= 1 ? null : "Tải ảnh"}
        </Upload>
      </Form.Item>
    </>
  );

  const formattedInitialValues = initialValues
    ? {
        ...initialValues,
        color: initialValues.color || undefined,
      }
    : undefined;

  const handleSubmit = async (values: Record<string, unknown>) => {
    let nextImageUrl = imageUrl;

    try {
      const imageOriginFile = imageFileList[0]?.originFileObj as
        | File
        | undefined;

      if (imageOriginFile) {
        setImageUploading(true);
        const result = await uploadGenreImage({
          file: imageOriginFile,
          folder: "genres",
        });
        nextImageUrl = result.url;
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải ảnh thể loại");
      console.error(error);
      setImageUploading(false);
      return;
    }

    try {
      await onSubmit({
        name: values.name as string,
        slug: values.slug as string | undefined,
        description: values.description as string | undefined,
        color: values.color as string | undefined,
        imageUrl: nextImageUrl,
      });
    } finally {
      setImageUploading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      const nextImageUrl = initialValues?.imageUrl || undefined;
      setImageUrl(nextImageUrl);
      setImageFileList(createInitialFileList(nextImageUrl));
    }
  }, [visible, initialValues]);

  return (
    <>
      <CommonFormModal
        visible={visible}
        title={initialValues ? "Chỉnh sửa thể loại" : "Thêm thể loại"}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        initialValues={formattedInitialValues}
        loading={loading || imageUploading}
        formItems={formItems}
        form={form}
        width={720}
        top={20}
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

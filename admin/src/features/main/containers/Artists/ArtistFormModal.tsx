"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Col,
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
import { Form as CommonFormModal } from "@/lib";
import { IArtistResponseData, IUserSelectItem } from "@/dtos/artists";
import { useUsersForSelect, useUploadFile } from "../../react-query";

const imageCardStyle: React.CSSProperties = {
  height: "100%",
  padding: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  background: "rgba(255,255,255,0.02)",
};

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface ArtistFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  initialValues?: IArtistResponseData | null;
  loading?: boolean;
}

function createInitialFileList(
  url: string | undefined,
  label: string,
): UploadFile[] {
  if (!url) {
    return [];
  }

  return [
    {
      uid: `existing-${label}`,
      name: label,
      status: "done",
      url,
    },
  ];
}

export function ArtistFormModal({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}: ArtistFormModalProps) {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;

  const [userSearchText, setUserSearchText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    initialValues?.avatarUrl || undefined,
  );
  const [coverUrl, setCoverUrl] = useState<string | undefined>(
    initialValues?.coverUrl || undefined,
  );
  const [avatarFileList, setAvatarFileList] = useState<UploadFile[]>([]);
  const [coverFileList, setCoverFileList] = useState<UploadFile[]>([]);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const { data: usersData, isLoading: usersLoading } = useUsersForSelect({
    page: 1,
    limit: 50,
    search: userSearchText
      ? { fields: ["username", "displayName", "email"], data: userSearchText }
      : undefined,
  });

  const { mutateAsync: uploadFile } = useUploadFile();

  const userOptions = useMemo(() => {
    return (
      usersData?.data?.map((user: IUserSelectItem) => ({
        label: user.displayName
          ? `${user.displayName} (@${user.username})`
          : `@${user.username}`,
        value: user.id,
      })) || []
    );
  }, [usersData]);

  const handleUserSearch = useCallback((value: string) => {
    setUserSearchText(value);
  }, []);

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

  const validateBeforeUpload = (file: FileType) => {
    const isUnder1MB = file.size / 1024 / 1024 < 1;

    if (!isUnder1MB) {
      message.error("Ảnh phải nhỏ hơn 1MB");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const avatarUploadProps: UploadProps = {
    accept: "image/*",
    listType: "picture-card",
    fileList: avatarFileList,
    maxCount: 1,
    beforeUpload: validateBeforeUpload,
    onPreview: handlePreview,
    onChange: ({ fileList }) => {
      setAvatarFileList(fileList);
      const currentFile = fileList[0];
      if (!currentFile) {
        setAvatarUrl(undefined);
      } else if (currentFile.url) {
        setAvatarUrl(currentFile.url);
      }
    },
  };

  const coverUploadProps: UploadProps = {
    accept: "image/*",
    listType: "picture-card",
    fileList: coverFileList,
    maxCount: 1,
    beforeUpload: validateBeforeUpload,
    onPreview: handlePreview,
    onChange: ({ fileList }) => {
      setCoverFileList(fileList);
      const currentFile = fileList[0];
      if (!currentFile) {
        setCoverUrl(undefined);
      } else if (currentFile.url) {
        setCoverUrl(currentFile.url);
      }
    },
  };

  const formItems = (
    <Row gutter={[16, 8]}>
      <Col xs={24} md={12}>
        <Form.Item
          name="userId"
          label="Tài khoản liên kết"
          rules={[{ required: !isEditing, message: "Vui lòng chọn tài khoản" }]}
        >
          <Select
            showSearch
            placeholder="Tìm và chọn tài khoản..."
            filterOption={false}
            onSearch={handleUserSearch}
            options={userOptions}
            loading={usersLoading}
            allowClear
            disabled={isEditing}
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="name"
          label="Tên nghệ sĩ"
          rules={[{ required: true, message: "Vui lòng nhập tên nghệ sĩ" }]}
        >
          <Input placeholder="Nhập tên nghệ sĩ" />
        </Form.Item>
      </Col>

      <Col xs={24} md={isEditing ? 12 : 24}>
        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            {
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: "Slug phải là kebab-case (vd: ten-nghe-si)",
            },
          ]}
        >
          <Input placeholder="Tự động tạo nếu để trống" />
        </Form.Item>
      </Col>

      {isEditing && (
        <Col xs={24} md={12}>
          <Form.Item name="verified" label="Xác minh" valuePropName="checked">
            <Switch checkedChildren="Đã xác minh" unCheckedChildren="Chưa" />
          </Form.Item>
        </Col>
      )}

      <Col span={24}>
        <Typography.Text strong>Hình ảnh nghệ sĩ</Typography.Text>
      </Col>

      <Col xs={24} md={6}>
        <div style={imageCardStyle}>
          <Typography.Text strong>Ảnh đại diện</Typography.Text>
          <div style={{ marginTop: 12 }}>
            <Upload {...avatarUploadProps}>
              {avatarFileList.length >= 1 ? null : "Tải ảnh"}
            </Upload>
          </div>
        </div>
      </Col>

      <Col xs={24} md={18}>
        <div style={imageCardStyle}>
          <Typography.Text strong>Ảnh bìa</Typography.Text>
          <div style={{ marginTop: 12 }}>
            <Upload {...coverUploadProps}>
              {coverFileList.length >= 1 ? null : "Tải ảnh"}
            </Upload>
          </div>
        </div>
      </Col>

      <Col span={24}>
        <Form.Item name="bio" label="Tiểu sử">
          <Input.TextArea rows={4} placeholder="Nhập tiểu sử nghệ sĩ..." />
        </Form.Item>
      </Col>
    </Row>
  );

  const formattedInitialValues = initialValues
    ? {
        ...initialValues,
      }
    : undefined;

  const handleSubmit = async (values: Record<string, unknown>) => {
    let nextAvatarUrl = avatarUrl;
    let nextCoverUrl = coverUrl;

    try {
      const avatarOriginFile = avatarFileList[0]?.originFileObj as
        | File
        | undefined;
      const coverOriginFile = coverFileList[0]?.originFileObj as
        | File
        | undefined;

      if (avatarOriginFile) {
        setAvatarUploading(true);
        const result = await uploadFile({
          file: avatarOriginFile,
          folder: "artists",
        });
        nextAvatarUrl = result.url;
      }

      if (coverOriginFile) {
        setCoverUploading(true);
        const result = await uploadFile({
          file: coverOriginFile,
          folder: "artists",
        });
        nextCoverUrl = result.url;
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải ảnh");
      console.error(error);
      setAvatarUploading(false);
      setCoverUploading(false);
      return;
    }

    try {
      await onSubmit({
        ...values,
        avatarUrl: nextAvatarUrl,
        coverUrl: nextCoverUrl,
      });
    } finally {
      setAvatarUploading(false);
      setCoverUploading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      const nextAvatarUrl = initialValues?.avatarUrl || undefined;
      const nextCoverUrl = initialValues?.coverUrl || undefined;

      setAvatarUrl(nextAvatarUrl);
      setCoverUrl(nextCoverUrl);
      setAvatarFileList(createInitialFileList(nextAvatarUrl, "avatar"));
      setCoverFileList(createInitialFileList(nextCoverUrl, "cover"));
      setUserSearchText("");
    }
  }, [visible, initialValues]);

  return (
    <>
      <CommonFormModal
        visible={visible}
        title={isEditing ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ"}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        initialValues={formattedInitialValues}
        loading={loading || avatarUploading || coverUploading}
        formItems={formItems}
        form={form}
        width={820}
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

"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Avatar,
  App,
  Row,
  Col,
} from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  IUserResponseData,
  IUserCreateRequest,
  IUserUpdateRequest,
  IUserCreateResponse,
  IUserUpdateResponse,
} from "@/dtos/users";
import type { UseMutationResult } from "@tanstack/react-query";
import type { UploadResponse } from "@/dtos/common";

interface UserFormModalProps {
  open: boolean;
  editingUser: IUserResponseData | null;
  onClose: () => void;
  createMutation: UseMutationResult<
    IUserCreateResponse,
    Error,
    IUserCreateRequest
  >;
  updateMutation: UseMutationResult<
    IUserUpdateResponse,
    Error,
    { id: number; data: IUserUpdateRequest }
  >;
  uploadMutation: UseMutationResult<
    UploadResponse,
    Error,
    { file: File; folder?: string }
  >;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  editingUser,
  onClose,
  createMutation,
  updateMutation,
  uploadMutation,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | undefined>();

  const isEditing = !!editingUser;

  // Derive avatar URL from editing user or local preview
  const displayAvatarUrl = localPreviewUrl || editingUser?.avatarUrl;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (editingUser) {
        form.setFieldsValue({
          displayName: editingUser.displayName,
          dateOfBirth: editingUser.dateOfBirth
            ? dayjs(editingUser.dateOfBirth)
            : undefined,
          country: editingUser.country,
        });
      } else {
        form.resetFields();
      }
      // Reset local state when opening modal
      setAvatarFile(null);
      setLocalPreviewUrl(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSelectFile = (file: File) => {
    setAvatarFile(file);
    // Create local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      let finalAvatarUrl = editingUser?.avatarUrl;

      // Upload avatar if new file selected
      if (avatarFile) {
        try {
          const result = await uploadMutation.mutateAsync({
            file: avatarFile,
            folder: "avatars",
          });
          finalAvatarUrl = result.url;
        } catch {
          message.error("Upload ảnh thất bại");
          return;
        }
      }

      if (isEditing) {
        const updateData: IUserUpdateRequest = {
          displayName: values.displayName,
          avatarUrl: finalAvatarUrl ?? undefined,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : undefined,
          country: values.country,
        };
        await updateMutation.mutateAsync({
          id: editingUser.id,
          data: updateData,
        });
        message.success("Cập nhật người dùng thành công");
      } else {
        const createData: IUserCreateRequest = {
          email: values.email,
          password: values.password,
          username: values.username,
          displayName: values.displayName,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : undefined,
          role: values.role,
          country: values.country,
        };
        await createMutation.mutateAsync(createData);
        message.success("Tạo người dùng thành công");
      }
      onClose();
    } catch {
      message.error(
        isEditing ? "Cập nhật thất bại" : "Tạo người dùng thất bại",
      );
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMutation.isPending;

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isLoading}
      okText={isEditing ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
      width={600}
    >
      <Form form={form} layout="vertical">
        {/* Avatar Upload */}
        <Form.Item label="Ảnh đại diện" style={{ textAlign: "center" }}>
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={handleSelectFile}
            accept="image/*"
          >
            <div style={{ cursor: "pointer" }}>
              <Avatar
                src={displayAvatarUrl}
                icon={!displayAvatarUrl && <UserOutlined />}
                size={100}
                style={{ marginBottom: 8 }}
              />
              <div style={{ color: "#1890ff" }}>
                <UploadOutlined /> Thay đổi ảnh
              </div>
            </div>
          </Upload>
        </Form.Item>

        {/* Create-only fields */}
        {!isEditing && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input placeholder="user@example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[
                    { required: true, message: "Vui lòng nhập username" },
                    { min: 3, message: "Username tối thiểu 3 ký tự" },
                  ]}
                >
                  <Input placeholder="username" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                    { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                  ]}
                >
                  <Input.Password placeholder="********" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="role" label="Vai trò" initialValue="user">
                  <Select
                    options={[
                      { value: "user", label: "User" },
                      { value: "artist", label: "Nghệ sĩ" },
                      { value: "admin", label: "Admin" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Common fields */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="displayName" label="Tên hiển thị">
              <Input placeholder="John Doe" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dateOfBirth" label="Ngày sinh">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày sinh"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="country" label="Quốc gia">
              <Input placeholder="VN" maxLength={2} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UserFormModal;

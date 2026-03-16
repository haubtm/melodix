"use client";

import React from "react";
import { Form, Input, Select, DatePicker, Row, Col } from "antd";
import { Form as CommonFormModal } from "@/lib";
import { IUserResponseData } from "@/dtos/users";
import dayjs from "dayjs";

interface UserFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
  initialValues?: IUserResponseData | null;
  loading?: boolean;
}

export function UserFormModal({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading,
}: UserFormModalProps) {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;

  const formItems = (
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
          <Input disabled={isEditing} placeholder="Nhập email" />
        </Form.Item>
      </Col>

      {!isEditing && (
        <Col span={12}>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        </Col>
      )}

      <Col span={12}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Vui lòng nhập username" }]}
        >
          <Input disabled={isEditing} placeholder="Nhập username" />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="displayName" label="Tên hiển thị">
          <Input placeholder="Nhập tên hiển thị" />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="role" label="Vai trò" initialValue="user">
          <Select disabled={isEditing}>
            <Select.Option value="user">Người dùng</Select.Option>
            <Select.Option value="artist">Nghệ sĩ</Select.Option>
            <Select.Option value="admin">Quản trị viên</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="country" label="Quốc gia">
          <Input placeholder="Nhập quốc gia" />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="dateOfBirth" label="Ngày sinh">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
      </Col>
    </Row>
  );

  const formattedInitialValues = initialValues
    ? {
        ...initialValues,
        dateOfBirth: initialValues.dateOfBirth
          ? dayjs(initialValues.dateOfBirth)
          : undefined,
      }
    : undefined;

  const handleSubmit = (values: Record<string, unknown>) => {
    const formattedValues = {
      ...values,
      dateOfBirth: (values.dateOfBirth as dayjs.Dayjs | undefined)
        ? (values.dateOfBirth as dayjs.Dayjs).format("YYYY-MM-DD")
        : undefined,
    };
    onSubmit(formattedValues);
  };

  return (
    <CommonFormModal
      visible={visible}
      title={isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      initialValues={formattedInitialValues}
      loading={loading}
      formItems={formItems}
      form={form}
      width={700}
    />
  );
}

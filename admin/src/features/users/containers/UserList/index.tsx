"use client";

import React from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Button,
  Space,
  Tooltip,
  Typography,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { IUserResponseData } from "@/dtos/users";
import { useUserListContainer } from "./hook";
import {
  Container,
  Header,
  Title,
  Filters,
  StyledCard,
  UserCell,
  UserInfo,
  UserName,
  UserEmail,
  StyledAvatar,
} from "./styles";
import { UserFormModal } from "../UserForm";

const { Text } = Typography;

const roleColors: Record<string, string> = {
  admin: "red",
  artist: "purple",
  user: "blue",
};

const subscriptionColors: Record<string, string> = {
  free: "default",
  premium: "gold",
  family: "green",
};

export const UserListContainer: React.FC = () => {
  const {
    data,
    isLoading,
    listParams,
    isModalOpen,
    editingUser,
    handlePageChange,
    handleSearch,
    handleFilterRole,
    handleFilterSubscription,
    handleDelete,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    createMutation,
    updateMutation,
    uploadMutation,
    refetch,
  } = useUserListContainer();

  const columns: ColumnsType<IUserResponseData> = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <UserCell>
          <StyledAvatar
            src={record.avatarUrl}
            icon={!record.avatarUrl && <UserOutlined />}
            size={40}
          />
          <UserInfo>
            <UserName>{record.displayName || record.username}</UserName>
            <UserEmail>{record.email}</UserEmail>
          </UserInfo>
        </UserCell>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={roleColors[role] || "default"}>
          {role === "admin" ? "Admin" : role === "artist" ? "Nghệ sĩ" : "User"}
        </Tag>
      ),
    },
    {
      title: "Gói",
      dataIndex: "subscriptionType",
      key: "subscriptionType",
      render: (type: string) => (
        <Tag color={subscriptionColors[type] || "default"}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.isActive ? "green" : "red"}>
            {record.isActive ? "Hoạt động" : "Bị khóa"}
          </Tag>
          {record.emailVerified && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Email đã xác thực
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Container>
      <Header>
        <Title>Quản lý người dùng</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            Thêm người dùng
          </Button>
        </Space>
      </Header>

      <Filters>
        <Input
          placeholder="Tìm kiếm theo tên, username, email..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          allowClear
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          placeholder="Vai trò"
          style={{ width: 150 }}
          allowClear
          onChange={handleFilterRole}
          options={[
            { value: "admin", label: "Admin" },
            { value: "artist", label: "Nghệ sĩ" },
            { value: "user", label: "User" },
          ]}
        />
        <Select
          placeholder="Gói đăng ký"
          style={{ width: 150 }}
          allowClear
          onChange={handleFilterSubscription}
          options={[
            { value: "free", label: "Free" },
            { value: "premium", label: "Premium" },
            { value: "family", label: "Family" },
          ]}
        />
      </Filters>

      <StyledCard>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: listParams.page,
            pageSize: listParams.limit,
            total: data?.metadata?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`,
            onChange: handlePageChange,
          }}
        />
      </StyledCard>

      <UserFormModal
        open={isModalOpen}
        editingUser={editingUser}
        onClose={handleCloseModal}
        createMutation={createMutation}
        updateMutation={updateMutation}
        uploadMutation={uploadMutation}
      />
    </Container>
  );
};

export default UserListContainer;

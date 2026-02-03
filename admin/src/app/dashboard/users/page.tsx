"use client";

import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Dropdown,
  Modal,
  message,
  Typography,
  Avatar,
} from "antd";
import type { MenuProps, TableProps } from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  UserOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { User, UserRole } from "@/types";
import styles from "./users.module.css";

const { Title } = Typography;
const { Search } = Input;

// Mock data
const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@melodix.com",
    username: "admin",
    displayName: "Admin User",
    avatarUrl: null,
    subscriptionType: "premium",
    role: "admin",
    isActive: true,
    emailVerified: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    email: "sontung@melodix.com",
    username: "sontungmtp",
    displayName: "Sơn Tùng M-TP",
    avatarUrl: "https://i.pravatar.cc/150?u=2",
    subscriptionType: "premium",
    role: "artist",
    isActive: true,
    emailVerified: true,
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-14T10:00:00Z",
  },
  {
    id: 3,
    email: "user@example.com",
    username: "normaluser",
    displayName: "Normal User",
    subscriptionType: "free",
    role: "user",
    isActive: true,
    emailVerified: true,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: 4,
    email: "banned@example.com",
    username: "banneduser",
    displayName: "Banned User",
    subscriptionType: "free",
    role: "user",
    isActive: false,
    emailVerified: true,
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
  },
];

const roleOptions = [
  { value: "", label: "Tất cả vai trò" },
  { value: "user", label: "Người dùng" },
  { value: "artist", label: "Nghệ sĩ" },
  { value: "admin", label: "Admin" },
];

const getRoleTag = (role: UserRole) => {
  const config = {
    user: { color: "default", text: "Người dùng" },
    artist: { color: "purple", text: "Nghệ sĩ" },
    admin: { color: "red", text: "Admin" },
  };
  const { color, text } = config[role];
  return <Tag color={color}>{text}</Tag>;
};

export default function UsersPage() {
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const getActionItems = (record: User): MenuProps["items"] => [
    { key: "view", icon: <UserOutlined />, label: "Xem hồ sơ" },
    { key: "edit", icon: <EditOutlined />, label: "Chỉnh sửa" },
    { type: "divider" },
    record.isActive
      ? {
          key: "ban",
          icon: <StopOutlined />,
          label: "Khóa tài khoản",
          danger: true,
        }
      : { key: "unban", icon: <CheckCircleOutlined />, label: "Mở khóa" },
  ];

  const handleAction = (key: string, record: User) => {
    switch (key) {
      case "view":
        message.info(`Xem hồ sơ: ${record.displayName}`);
        break;
      case "edit":
        message.info(`Chỉnh sửa: ${record.displayName}`);
        break;
      case "ban":
        Modal.confirm({
          title: "Khóa tài khoản",
          content: `Bạn có chắc muốn khóa tài khoản "${record.displayName}"?`,
          okType: "danger",
          onOk: () => message.success("Đã khóa tài khoản"),
        });
        break;
      case "unban":
        Modal.confirm({
          title: "Mở khóa tài khoản",
          content: `Bạn có chắc muốn mở khóa tài khoản "${record.displayName}"?`,
          onOk: () => message.success("Đã mở khóa tài khoản"),
        });
        break;
    }
  };

  const columns: TableProps<User>["columns"] = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <div className={styles.userCell}>
          <Avatar
            size={40}
            src={record.avatarUrl}
            icon={!record.avatarUrl && <UserOutlined />}
          />
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {record.displayName || record.username}
            </span>
            <span className={styles.userEmail}>{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role: UserRole) => getRoleTag(role),
    },
    {
      title: "Gói",
      dataIndex: "subscriptionType",
      key: "subscriptionType",
      width: 120,
      render: (type: string) => (
        <Tag color={type === "premium" ? "gold" : "default"}>
          {type === "premium" ? "Premium" : "Free"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: getActionItems(record),
            onClick: ({ key }) => handleAction(key, record),
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredData = mockUsers.filter((user) => {
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          Quản lý người dùng
        </Title>
      </div>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <Space wrap>
          <Search
            placeholder="Tìm kiếm người dùng..."
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Vai trò"
            style={{ width: 160 }}
            options={roleOptions}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
        />
      </Card>
    </div>
  );
}

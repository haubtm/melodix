"use client";

import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Tag,
  Dropdown,
  Modal,
  message,
  Typography,
  Avatar,
} from "antd";
import type { MenuProps, TableProps } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Album } from "@/types";
import styles from "./albums.module.css";

const { Title } = Typography;
const { Search } = Input;

// Mock data
const mockAlbums: Album[] = [
  {
    id: 1,
    title: "M-TP Collection",
    slug: "m-tp-collection",
    artistId: 1,
    artist: {
      id: 1,
      name: "Sơn Tùng M-TP",
      slug: "son-tung-mtp",
      verified: true,
      monthlyListeners: 5000000,
      createdAt: "",
      updatedAt: "",
    },
    albumType: "album",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273123456",
    releaseDate: "2024-01-01",
    totalTracks: 12,
    durationMs: 3600000,
    status: "published",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Waiting",
    slug: "waiting",
    artistId: 2,
    artist: {
      id: 2,
      name: "MONO",
      slug: "mono",
      verified: true,
      monthlyListeners: 3000000,
      createdAt: "",
      updatedAt: "",
    },
    albumType: "ep",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273789012",
    releaseDate: "2023-12-15",
    totalTracks: 5,
    durationMs: 1200000,
    status: "published",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
];

const albumTypeLabels = {
  album: { color: "blue", text: "Album" },
  single: { color: "green", text: "Single" },
  ep: { color: "purple", text: "EP" },
  compilation: { color: "orange", text: "Compilation" },
};

const formatDuration = (ms: number) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} phút`;
};

export default function AlbumsPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const actionItems: MenuProps["items"] = [
    { key: "view", icon: <EyeOutlined />, label: "Xem chi tiết" },
    { key: "edit", icon: <EditOutlined />, label: "Chỉnh sửa" },
    { type: "divider" },
    { key: "delete", icon: <DeleteOutlined />, label: "Xóa", danger: true },
  ];

  const handleAction = (key: string, record: Album) => {
    switch (key) {
      case "view":
        message.info(`Xem chi tiết: ${record.title}`);
        break;
      case "edit":
        message.info(`Chỉnh sửa: ${record.title}`);
        break;
      case "delete":
        Modal.confirm({
          title: "Xác nhận xóa",
          content: `Bạn có chắc muốn xóa album "${record.title}"?`,
          okType: "danger",
          onOk: () => message.success("Đã xóa album"),
        });
        break;
    }
  };

  const columns: TableProps<Album>["columns"] = [
    {
      title: "Album",
      key: "album",
      render: (_, record) => (
        <div className={styles.albumCell}>
          <Avatar
            shape="square"
            size={56}
            src={record.coverUrl}
            icon={<PlayCircleOutlined />}
          />
          <div className={styles.albumInfo}>
            <span className={styles.albumTitle}>{record.title}</span>
            <span className={styles.albumArtist}>{record.artist?.name}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "albumType",
      key: "albumType",
      width: 120,
      render: (type: keyof typeof albumTypeLabels) => {
        const config = albumTypeLabels[type];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Số bài",
      dataIndex: "totalTracks",
      key: "totalTracks",
      width: 100,
      render: (count: number) => `${count} bài`,
    },
    {
      title: "Thời lượng",
      dataIndex: "durationMs",
      key: "duration",
      width: 120,
      render: (ms: number) => formatDuration(ms),
    },
    {
      title: "Ngày phát hành",
      dataIndex: "releaseDate",
      key: "releaseDate",
      width: 140,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "",
      key: "actions",
      width: 60,
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: actionItems,
            onClick: ({ key }) => handleAction(key, record),
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredData = mockAlbums.filter((album) =>
    album.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          Quản lý Albums
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm album
        </Button>
      </div>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <Search
          placeholder="Tìm kiếm album..."
          allowClear
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
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
            showTotal: (total) => `Tổng ${total} albums`,
          }}
        />
      </Card>
    </div>
  );
}

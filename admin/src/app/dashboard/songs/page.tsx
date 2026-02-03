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
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "@/store/hooks";
import { isAdmin } from "@/store/slices/authSlice";
import { Song, ContentStatus } from "@/types";
import styles from "./songs.module.css";

const { Title } = Typography;
const { Search } = Input;

// Mock data
const mockSongs: Song[] = [
  {
    id: 1,
    title: "Có Chắc Yêu Là Đây",
    slug: "co-chac-yeu-la-day",
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
    durationMs: 234000,
    audioUrl: "/audio/sample.mp3",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273123456",
    playCount: 125000,
    explicit: false,
    status: "published",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Waiting For You",
    slug: "waiting-for-you",
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
    durationMs: 198000,
    audioUrl: "/audio/sample2.mp3",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273789012",
    playCount: 98000,
    explicit: false,
    status: "pending",
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-14T10:00:00Z",
  },
  {
    id: 3,
    title: "Đừng Làm Trái Tim Anh Đau",
    slug: "dung-lam-trai-tim-anh-dau",
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
    durationMs: 267000,
    audioUrl: "/audio/sample3.mp3",
    playCount: 87000,
    explicit: false,
    status: "rejected",
    rejectionReason: "Chất lượng âm thanh chưa đạt yêu cầu",
    createdAt: "2024-01-13T10:00:00Z",
    updatedAt: "2024-01-13T10:00:00Z",
  },
];

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "draft", label: "Nháp" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "published", label: "Đã xuất bản" },
  { value: "rejected", label: "Từ chối" },
];

const getStatusTag = (status: ContentStatus) => {
  const config = {
    draft: { color: "default", text: "Nháp" },
    pending: { color: "orange", text: "Chờ duyệt" },
    published: { color: "green", text: "Đã xuất bản" },
    rejected: { color: "red", text: "Từ chối" },
  };
  const { color, text } = config[status];
  return <Tag color={color}>{text}</Tag>;
};

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default function SongsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const userIsAdmin = isAdmin(user);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const getActionItems = (record: Song): MenuProps["items"] => {
    const items: MenuProps["items"] = [
      {
        key: "view",
        icon: <EyeOutlined />,
        label: "Xem chi tiết",
      },
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Chỉnh sửa",
      },
    ];

    if (userIsAdmin && record.status === "pending") {
      items.push(
        { type: "divider" },
        {
          key: "approve",
          icon: <CheckOutlined />,
          label: "Duyệt",
        },
        {
          key: "reject",
          icon: <CloseOutlined />,
          label: "Từ chối",
          danger: true,
        },
      );
    }

    items.push(
      { type: "divider" },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Xóa",
        danger: true,
      },
    );

    return items;
  };

  const handleAction = (key: string, record: Song) => {
    switch (key) {
      case "view":
        message.info(`Xem chi tiết: ${record.title}`);
        break;
      case "edit":
        message.info(`Chỉnh sửa: ${record.title}`);
        break;
      case "approve":
        Modal.confirm({
          title: "Xác nhận duyệt",
          content: `Bạn có chắc muốn duyệt bài hát "${record.title}"?`,
          onOk: () => message.success("Đã duyệt bài hát"),
        });
        break;
      case "reject":
        Modal.confirm({
          title: "Từ chối bài hát",
          content: "Vui lòng nhập lý do từ chối",
          onOk: () => message.success("Đã từ chối bài hát"),
        });
        break;
      case "delete":
        Modal.confirm({
          title: "Xác nhận xóa",
          content: `Bạn có chắc muốn xóa bài hát "${record.title}"?`,
          okType: "danger",
          onOk: () => message.success("Đã xóa bài hát"),
        });
        break;
    }
  };

  const columns: TableProps<Song>["columns"] = [
    {
      title: "Bài hát",
      key: "song",
      render: (_, record) => (
        <div className={styles.songCell}>
          <Avatar
            shape="square"
            size={48}
            src={record.coverUrl}
            icon={<PlayCircleOutlined />}
          />
          <div className={styles.songInfo}>
            <span className={styles.songTitle}>{record.title}</span>
            <span className={styles.songArtist}>{record.artist?.name}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "durationMs",
      key: "duration",
      width: 100,
      render: (ms: number) => formatDuration(ms),
    },
    {
      title: "Lượt nghe",
      dataIndex: "playCount",
      key: "playCount",
      width: 120,
      sorter: (a, b) => a.playCount - b.playCount,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: ContentStatus) => getStatusTag(status),
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

  const filteredData = mockSongs.filter((song) => {
    const matchesSearch = song.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || song.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <Title level={2} className={styles.title}>
            Quản lý bài hát
          </Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm bài hát
        </Button>
      </div>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <Space wrap>
          <Search
            placeholder="Tìm kiếm bài hát..."
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 180 }}
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
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
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bài hát`,
          }}
        />
      </Card>
    </div>
  );
}

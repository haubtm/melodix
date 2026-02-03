"use client";

import React from "react";
import { Row, Col, Card, Statistic, Typography, Table, Tag } from "antd";
import {
  UserOutlined,
  CustomerServiceOutlined,
  PlaySquareOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "@/store/hooks";
import { isAdmin } from "@/store/slices/authSlice";
import styles from "./dashboard.module.css";

const { Title, Text } = Typography;

// Mock data for dashboard
const mockStats = {
  totalUsers: 12543,
  userGrowth: 12.5,
  totalSongs: 8432,
  songGrowth: 8.2,
  totalAlbums: 1256,
  albumGrowth: 5.8,
  totalArtists: 342,
  artistGrowth: 15.3,
  pendingApprovals: 23,
  totalPlays: 1543210,
};

const mockPendingItems = [
  {
    id: 1,
    title: "Đêm Nay Không Ngủ",
    artist: "Sơn Tùng M-TP",
    type: "song",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "Album Mới",
    artist: "Đen Vâu",
    type: "album",
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    title: "Bài Hát Mới 2",
    artist: "Hoàng Thùy Linh",
    type: "song",
    createdAt: "2024-01-14",
  },
];

const mockRecentSongs = [
  {
    id: 1,
    title: "Có Chắc Yêu Là Đây",
    artist: "Sơn Tùng M-TP",
    plays: 125000,
    status: "published",
  },
  {
    id: 2,
    title: "Waiting For You",
    artist: "MONO",
    plays: 98000,
    status: "published",
  },
  {
    id: 3,
    title: "Đừng Làm Trái Tim Anh Đau",
    artist: "Sơn Tùng M-TP",
    plays: 87000,
    status: "pending",
  },
];

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const userIsAdmin = isAdmin(user);

  const statCards = [
    {
      title: "Tổng người dùng",
      value: mockStats.totalUsers,
      icon: <UserOutlined />,
      color: "#1890ff",
      growth: mockStats.userGrowth,
      adminOnly: true,
    },
    {
      title: "Tổng bài hát",
      value: mockStats.totalSongs,
      icon: <CustomerServiceOutlined />,
      color: "#52c41a",
      growth: mockStats.songGrowth,
    },
    {
      title: "Tổng albums",
      value: mockStats.totalAlbums,
      icon: <PlaySquareOutlined />,
      color: "#722ed1",
      growth: mockStats.albumGrowth,
    },
    {
      title: "Tổng nghệ sĩ",
      value: mockStats.totalArtists,
      icon: <TeamOutlined />,
      color: "#fa8c16",
      growth: mockStats.artistGrowth,
      adminOnly: true,
    },
  ];

  const pendingColumns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Nghệ sĩ", dataIndex: "artist", key: "artist" },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "song" ? "blue" : "purple"}>
          {type === "song" ? "Bài hát" : "Album"}
        </Tag>
      ),
    },
    { title: "Ngày gửi", dataIndex: "createdAt", key: "createdAt" },
  ];

  const recentColumns = [
    { title: "Bài hát", dataIndex: "title", key: "title" },
    { title: "Nghệ sĩ", dataIndex: "artist", key: "artist" },
    {
      title: "Lượt nghe",
      dataIndex: "plays",
      key: "plays",
      render: (plays: number) => plays.toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "published" ? "green" : "orange"}>
          {status === "published" ? "Đã xuất bản" : "Chờ duyệt"}
        </Tag>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          Dashboard
        </Title>
        <Text type="secondary">
          Xin chào, {user?.displayName || user?.username || "Admin"}!
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        {statCards
          .filter((card) => !card.adminOnly || userIsAdmin)
          .map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{ background: card.color }}
                >
                  {card.icon}
                </div>
                <Statistic
                  title={card.title}
                  value={card.value}
                  styles={{ content: { fontSize: 28, fontWeight: 600 } }}
                />
                <div className={styles.growth}>
                  {card.growth > 0 ? (
                    <RiseOutlined style={{ color: "#52c41a" }} />
                  ) : (
                    <FallOutlined style={{ color: "#ff4d4f" }} />
                  )}
                  <span
                    style={{ color: card.growth > 0 ? "#52c41a" : "#ff4d4f" }}
                  >
                    {Math.abs(card.growth)}%
                  </span>
                  <Text type="secondary"> so với tháng trước</Text>
                </div>
              </Card>
            </Col>
          ))}
      </Row>

      {/* Pending Approvals - Admin only */}
      {userIsAdmin && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Chờ duyệt ({mockStats.pendingApprovals})
                </span>
              }
              extra={<a href="/dashboard/approvals">Xem tất cả</a>}
            >
              <Table
                dataSource={mockPendingItems}
                columns={pendingColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="Bài hát gần đây"
              extra={<a href="/dashboard/songs">Xem tất cả</a>}
            >
              <Table
                dataSource={mockRecentSongs}
                columns={recentColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Artist view - Recent songs */}
      {!userIsAdmin && (
        <Card
          title="Bài hát của bạn"
          extra={<a href="/dashboard/songs">Xem tất cả</a>}
        >
          <Table
            dataSource={mockRecentSongs}
            columns={recentColumns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}

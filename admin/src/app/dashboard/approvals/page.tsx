"use client";

import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  message,
  Typography,
  Avatar,
  Empty,
  Tabs,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
  PlaySquareOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Song, Album, ContentStatus } from "@/types";
import styles from "./approvals.module.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface PendingItem {
  id: number;
  type: "song" | "album";
  title: string;
  artistName: string;
  coverUrl?: string;
  submittedAt: string;
  durationMs?: number;
  totalTracks?: number;
}

// Mock data
const mockPendingItems: PendingItem[] = [
  {
    id: 1,
    type: "song",
    title: "Đêm Nay Không Ngủ",
    artistName: "Sơn Tùng M-TP",
    coverUrl: "https://i.pravatar.cc/150?u=song1",
    submittedAt: "2024-01-15T10:00:00Z",
    durationMs: 234000,
  },
  {
    id: 2,
    type: "album",
    title: "Album Mới 2024",
    artistName: "Đen Vâu",
    coverUrl: "https://i.pravatar.cc/150?u=album1",
    submittedAt: "2024-01-14T10:00:00Z",
    totalTracks: 10,
  },
  {
    id: 3,
    type: "song",
    title: "Bài Hát Mới 2",
    artistName: "Hoàng Thùy Linh",
    coverUrl: "https://i.pravatar.cc/150?u=song2",
    submittedAt: "2024-01-14T08:00:00Z",
    durationMs: 198000,
  },
];

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return "Vừa xong";
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return d.toLocaleDateString("vi-VN");
};

export default function ApprovalsPage() {
  const [items, setItems] = useState(mockPendingItems);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleApprove = (item: PendingItem) => {
    Modal.confirm({
      title: "Xác nhận duyệt",
      content: `Bạn có chắc muốn duyệt ${item.type === "song" ? "bài hát" : "album"} "${item.title}"?`,
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: () => {
        setItems(items.filter((i) => i.id !== item.id));
        message.success(
          `Đã duyệt ${item.type === "song" ? "bài hát" : "album"} "${item.title}"`,
        );
      },
    });
  };

  const openRejectModal = (item: PendingItem) => {
    setSelectedItem(item);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối");
      return;
    }
    if (selectedItem) {
      setItems(items.filter((i) => i.id !== selectedItem.id));
      message.success(
        `Đã từ chối ${selectedItem.type === "song" ? "bài hát" : "album"} "${selectedItem.title}"`,
      );
    }
    setRejectModalOpen(false);
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  const tabItems = [
    { key: "all", label: `Tất cả (${items.length})` },
    {
      key: "song",
      label: `Bài hát (${items.filter((i) => i.type === "song").length})`,
    },
    {
      key: "album",
      label: `Albums (${items.filter((i) => i.type === "album").length})`,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <Title level={2} className={styles.title}>
            Duyệt nội dung
          </Title>
          <Text type="secondary">
            Xem và duyệt các bài hát, album đang chờ phê duyệt
          </Text>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className={styles.tabs}
      />

      {/* Content */}
      {filteredItems.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có nội dung nào đang chờ duyệt"
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredItems.map((item) => (
            <Col xs={24} md={12} lg={8} key={`${item.type}-${item.id}`}>
              <Card className={styles.approvalCard}>
                {/* Header */}
                <div className={styles.cardHeader}>
                  <Avatar
                    shape="square"
                    size={80}
                    src={item.coverUrl}
                    icon={
                      item.type === "song" ? (
                        <CustomerServiceOutlined />
                      ) : (
                        <PlaySquareOutlined />
                      )
                    }
                  />
                  <div className={styles.cardInfo}>
                    <Tag color={item.type === "song" ? "blue" : "purple"}>
                      {item.type === "song" ? "Bài hát" : "Album"}
                    </Tag>
                    <Title level={5} className={styles.cardTitle}>
                      {item.title}
                    </Title>
                    <Text type="secondary">{item.artistName}</Text>
                  </div>
                </div>

                {/* Meta */}
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <ClockCircleOutlined />
                    <span>{formatDate(item.submittedAt)}</span>
                  </div>
                  {item.durationMs && (
                    <div className={styles.metaItem}>
                      <PlayCircleOutlined />
                      <span>{formatDuration(item.durationMs)}</span>
                    </div>
                  )}
                  {item.totalTracks && (
                    <div className={styles.metaItem}>
                      <CustomerServiceOutlined />
                      <span>{item.totalTracks} bài</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove(item)}
                    block
                  >
                    Duyệt
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => openRejectModal(item)}
                    block
                  >
                    Từ chối
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Reject Modal */}
      <Modal
        title="Từ chối nội dung"
        open={rejectModalOpen}
        onOk={handleReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="Từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
      >
        <Paragraph>
          Bạn đang từ chối <strong>{selectedItem?.title}</strong> của{" "}
          <strong>{selectedItem?.artistName}</strong>
        </Paragraph>
        <TextArea
          rows={4}
          placeholder="Nhập lý do từ chối..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}

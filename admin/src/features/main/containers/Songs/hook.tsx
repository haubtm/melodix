"use client";

import { useState, useMemo } from "react";
import { message, Modal } from "antd";
import type { MenuProps } from "antd";
import { Song } from "@/dtos";
import { useAppSelector } from "@/store/hooks";
import { isAdmin } from "@/store/slices/authSlice";

// Mock data - will be replaced with API
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

export const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "draft", label: "Nháp" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "published", label: "Đã xuất bản" },
  { value: "rejected", label: "Từ chối" },
];

export const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const useSongsContainer = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userIsAdmin = isAdmin(user);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const filteredData = useMemo(() => {
    return mockSongs.filter((song) => {
      const matchesSearch = song.title
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesStatus = !statusFilter || song.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchText, statusFilter]);

  const getActionItems = (record: Song): MenuProps["items"] => {
    const items: MenuProps["items"] = [
      { key: "view", label: "Xem chi tiết" },
      { key: "edit", label: "Chỉnh sửa" },
    ];

    if (userIsAdmin && record.status === "pending") {
      items.push(
        { type: "divider" },
        { key: "approve", label: "Duyệt" },
        { key: "reject", label: "Từ chối", danger: true },
      );
    }

    items.push(
      { type: "divider" },
      { key: "delete", label: "Xóa", danger: true },
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

  return {
    userIsAdmin,
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    selectedRowKeys,
    setSelectedRowKeys,
    filteredData,
    getActionItems,
    handleAction,
  };
};

"use client";

import React from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Dropdown,
  Avatar,
} from "antd";
import type { TableProps } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Song, ContentStatus } from "@/dtos";
import * as S from "./styles";
import { useSongsContainer, statusOptions, formatDuration } from "./hook";

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

export const SongsContainer = () => {
  const {
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    selectedRowKeys,
    setSelectedRowKeys,
    filteredData,
    getActionItems,
    handleAction,
  } = useSongsContainer();

  const columns: TableProps<Song>["columns"] = [
    {
      title: "Bài hát",
      key: "song",
      render: (_, record) => (
        <S.SongCell>
          <Avatar
            shape="square"
            size={48}
            src={record.coverUrl}
            icon={<PlayCircleOutlined />}
          />
          <S.SongInfo>
            <S.SongTitle>{record.title}</S.SongTitle>
            <S.SongArtist>{record.artist?.name}</S.SongArtist>
          </S.SongInfo>
        </S.SongCell>
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

  return (
    <S.Root>
      <S.Header $justify="space-between" $align="center">
        <S.Title>Quản lý bài hát</S.Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm bài hát
        </Button>
      </S.Header>

      <S.FilterCard>
        <Space wrap>
          <Input
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
      </S.FilterCard>

      <S.TableCard>
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
      </S.TableCard>
    </S.Root>
  );
};

export default SongsContainer;

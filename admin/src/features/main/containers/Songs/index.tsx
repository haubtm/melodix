"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Input,
  Modal,
  Select,
  TableColumnsType,
  Tag,
  message,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Flex, Table, useTableColumns } from "@/lib";
import {
  CreateSongRequest,
  ListSongsRequest,
  Song,
  SongStatus,
  UpdateSongRequest,
} from "@/dtos";
import {
  useApproveSong,
  useCreateSong,
  useDeleteSong,
  useRejectSong,
  useSongsList,
  useUpdateSong,
} from "../../react-query";
import { songKeys } from "../../react-query/query-keys";
import { SongFormModal } from "./SongFormModal";

const { Search, TextArea } = Input;

const statusOptions = [
  { value: undefined, label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const getStatusTag = (status: SongStatus) => {
  const config = {
    pending: { color: "orange", text: "Chờ duyệt" },
    approved: { color: "green", text: "Đã duyệt" },
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

export const SongsContainer = () => {
  const [queryParams, setQueryParams] = useState<ListSongsRequest>({
    page: 1,
    limit: 10,
    search: undefined,
    status: undefined,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const queryClient = useQueryClient();
  const { getDefaultActions } = useTableColumns<Song>();

  const { data, isLoading, isFetching } = useSongsList(queryParams);
  const { mutateAsync: createSong, isPending: isCreating } = useCreateSong();
  const { mutateAsync: updateSong, isPending: isUpdating } = useUpdateSong();
  const { mutateAsync: deleteSong } = useDeleteSong();
  const { mutateAsync: approveSong } = useApproveSong();
  const { mutateAsync: rejectSong } = useRejectSong();

  const columns = useMemo<TableColumnsType<Song>>(
    () => [
      {
        title: "Bài hát",
        key: "song",
        render: (_, record) => (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar
              shape="square"
              size={48}
              src={record.coverUrl}
              icon={<PlayCircleOutlined />}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span>{record.title}</span>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                {record.primaryArtist?.name || "-"}
              </span>
            </div>
          </div>
        ),
      },
      {
        title: "Album",
        dataIndex: ["album", "title"],
        key: "album",
        render: (_: unknown, record) => record.album?.title || "-",
      },
      {
        title: "Thời lượng",
        dataIndex: "durationMs",
        key: "durationMs",
        width: 110,
        render: (ms: number) => formatDuration(ms),
      },
      {
        title: "Lượt nghe",
        dataIndex: "playCount",
        key: "playCount",
        width: 120,
        render: (count: number) => count.toLocaleString(),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: SongStatus) => getStatusTag(status),
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 130,
        render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      },
      getDefaultActions({
        renderExtraActions: (record) =>
          record.status === "pending" ? (
            <>
              <Button
                type="text"
                icon={<CheckOutlined />}
                style={{ color: "#52c41a" }}
                onClick={async (event) => {
                  event.stopPropagation();
                  await approveSong(record.id);
                  message.success("Đã duyệt bài hát");
                }}
              />
              <Button
                type="text"
                danger
                icon={<CloseOutlined />}
                onClick={(event) => {
                  event.stopPropagation();
                  let rejectionReason = "";
                  Modal.confirm({
                    title: "Từ chối bài hát",
                    content: (
                      <TextArea
                        rows={4}
                        placeholder="Nhập lý do từ chối"
                        onChange={(e) => {
                          rejectionReason = e.target.value;
                        }}
                      />
                    ),
                    onOk: async () => {
                      await rejectSong({
                        id: record.id,
                        reason: rejectionReason,
                      });
                      message.success("Đã từ chối bài hát");
                    },
                  });
                }}
              />
            </>
          ) : null,
        onEdit: (record) => {
          setEditingSong(record);
          setIsModalVisible(true);
        },
        onDelete: async (record) => {
          await deleteSong(record.id);
          message.success("Đã xóa bài hát");
        },
      }),
    ],
    [approveSong, deleteSong, getDefaultActions, rejectSong],
  );

  const handleSearch = (value: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: value ? { fields: ["title"], data: value } : undefined,
      page: 1,
    }));
  };

  const handleStatusFilter = (value: SongStatus | undefined) => {
    setQueryParams((prev) => ({
      ...prev,
      status: value,
      page: 1,
    }));
  };

  const handleModalSubmit = async (
    values: CreateSongRequest | UpdateSongRequest,
  ) => {
    try {
      if (editingSong) {
        await updateSong({ id: editingSong.id, data: values });
        message.success("Cập nhật bài hát thành công");
      } else {
        await createSong(values as CreateSongRequest);
        message.success("Thêm bài hát thành công");
      }

      setIsModalVisible(false);
      setEditingSong(null);
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      message.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <Flex $direction="column" $gap={24} style={{ width: "100%" }}>
      <Flex $justify="space-between" $align="center">
        <Flex $gap={16} $align="center">
          <Search
            placeholder="Tìm kiếm bài hát..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 320 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 180 }}
            options={statusOptions}
            onChange={handleStatusFilter}
          />
        </Flex>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingSong(null);
            setIsModalVisible(true);
          }}
        >
          Thêm bài hát
        </Button>
      </Flex>

      <Table<Song>
        rowKey="id"
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading || isFetching}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.limit,
          total: data?.metadata?.total || 0,
          showSizeChanger: true,
        }}
        onChange={(pagination) => {
          setQueryParams((prev) => ({
            ...prev,
            page: pagination.current,
            limit: pagination.pageSize,
          }));
        }}
        onRow={(record) => ({
          onClick: () => {
            setEditingSong(record);
            setIsModalVisible(true);
          },
          style: { cursor: "pointer" },
        })}
      />

      {isModalVisible && (
        <SongFormModal
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingSong(null);
          }}
          onSubmit={handleModalSubmit}
          initialValues={editingSong}
          loading={isCreating || isUpdating}
        />
      )}
    </Flex>
  );
};

export default SongsContainer;

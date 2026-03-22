"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  Input,
  message,
  Select,
  TablePaginationConfig,
  Tag,
} from "antd";
import { PictureOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import { Flex, Table, useTableColumns } from "@/lib";
import { albumApi } from "@/api/albums";
import { songApi } from "@/api/songs";
import {
  AlbumType,
  IAlbumCreateRequest,
  IAlbumListRequest,
  IAlbumResponseData,
  IAlbumUpdateRequest,
} from "@/dtos/albums";
import { PAGINATION } from "@/common/constants";
import {
  albumKeys,
  useAlbumsList,
  useCreateAlbum,
  useDeleteAlbum,
  useUpdateAlbum,
} from "../../react-query";
import { AlbumFormModal } from "./AlbumFormModal";

const { Search } = Input;

const albumTypeMap: Record<AlbumType, { color: string; label: string }> = {
  album: { color: "blue", label: "Album" },
  single: { color: "green", label: "Single" },
  ep: { color: "purple", label: "EP" },
  compilation: { color: "orange", label: "Compilation" },
};

export function AlbumListContainer() {
  const [queryParams, setQueryParams] = useState<IAlbumListRequest>({
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    search: undefined,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<IAlbumResponseData | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useAlbumsList(queryParams);
  const { mutateAsync: createAlbum, isPending: isCreating } = useCreateAlbum();
  const { mutateAsync: updateAlbum, isPending: isUpdating } = useUpdateAlbum();
  const { mutateAsync: deleteAlbum } = useDeleteAlbum();

  const handleSearch = (value: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: value
        ? { fields: ["title", "description"], data: value }
        : undefined,
      page: 1,
    }));
  };

  const handlePublishedChange = (value: string | undefined) => {
    setQueryParams((prev) => ({
      ...prev,
      isPublished: value === undefined ? undefined : value === "published",
      page: 1,
    }));
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setQueryParams((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  const { getDefaultActions } = useTableColumns<IAlbumResponseData>();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      fixed: "left" as const,
    },
    {
      title: "Bìa",
      dataIndex: "coverUrl",
      key: "coverUrl",
      width: 90,
      render: (coverUrl: string | null) => (
        <Avatar
          src={coverUrl}
          shape="square"
          size={44}
          icon={!coverUrl ? <PictureOutlined /> : undefined}
        />
      ),
    },
    {
      title: "Tên album",
      dataIndex: "title",
      key: "title",
      width: 220,
      fixed: "left" as const,
    },
    {
      title: "Nghệ sĩ",
      dataIndex: ["artist", "name"],
      key: "artist",
      width: 180,
      render: (_: unknown, record: IAlbumResponseData) =>
        record.artist?.name || `#${record.artistId}`,
    },
    {
      title: "Loại",
      dataIndex: "albumType",
      key: "albumType",
      width: 140,
      render: (albumType: AlbumType) => {
        const config = albumTypeMap[albumType];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Ngày phát hành",
      dataIndex: "releaseDate",
      key: "releaseDate",
      width: 150,
      render: (text: string | null) =>
        text ? dayjs(text).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Số bài",
      dataIndex: "totalTracks",
      key: "totalTracks",
      width: 100,
      render: (value: number) => value || 0,
    },
    {
      title: "Xuất bản",
      dataIndex: "isPublished",
      key: "isPublished",
      width: 120,
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? "success" : "default"}>
          {isPublished ? "Đã xuất bản" : "Bản nháp"}
        </Tag>
      ),
    },
    getDefaultActions({
      onEdit: (record) => {
        setEditingAlbum(record);
        setIsModalVisible(true);
      },
      onDelete: async (record) => {
        try {
          await deleteAlbum(record.id);
          message.success("Xóa album thành công");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa album");
          console.error(error);
        }
      },
    }),
  ];

  const handleModalSubmit = async (
    values: IAlbumCreateRequest | IAlbumUpdateRequest,
    options?: {
      orderedSongs?: Array<{ id: number; trackNumber?: number | null }>;
    },
  ) => {
    try {
      if (editingAlbum) {
        await updateAlbum({ id: editingAlbum.id, data: values });
        if (options?.orderedSongs?.length) {
          await Promise.all(
            options.orderedSongs.map((song) =>
              songApi.update(song.id, {
                trackNumber: song.trackNumber ?? undefined,
              }),
            ),
          );
        }
        message.success("Cập nhật album thành công");
      } else {
        await createAlbum(values as IAlbumCreateRequest);
        message.success("Thêm album thành công");
      }
      setIsModalVisible(false);
      setEditingAlbum(null);
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      message.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingAlbum(null);
  };

  const handleDeleteMany = async (keys: React.Key[]) => {
    try {
      await albumApi.deleteMany(keys as number[]);
      message.success(`Đã xóa ${keys.length} album`);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa nhiều album");
      console.error(error);
    }
  };

  return (
    <Flex $direction="column" $gap={24} style={{ width: "100%" }}>
      <Flex $justify="space-between" $align="center">
        <Flex $gap={16} $align="center">
          <Search
            placeholder="Tìm kiếm theo tên, mô tả..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 320 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            onChange={handlePublishedChange}
            style={{ width: 160 }}
            options={[
              { label: "Đã xuất bản", value: "published" },
              { label: "Bản nháp", value: "draft" },
            ]}
          />
        </Flex>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingAlbum(null);
            setIsModalVisible(true);
          }}
        >
          Thêm album
        </Button>
      </Flex>

      <Table<IAlbumResponseData>
        rowKey="id"
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading || isFetching}
        onChange={handleTableChange}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.limit,
          total: data?.metadata?.total || 0,
          showSizeChanger: true,
        }}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        onDeleteMany={handleDeleteMany}
        onRow={(record) => ({
          onClick: () => {
            setEditingAlbum(record);
            setIsModalVisible(true);
          },
          style: { cursor: "pointer" },
        })}
      />

      {isModalVisible && (
        <AlbumFormModal
          visible={isModalVisible}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          initialValues={editingAlbum}
          loading={isCreating || isUpdating}
        />
      )}
    </Flex>
  );
}

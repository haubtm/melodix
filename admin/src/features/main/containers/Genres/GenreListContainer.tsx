"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  Input,
  message,
  TablePaginationConfig,
  Tag,
} from "antd";
import {
  BgColorsOutlined,
  PlusOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Flex, Table, useTableColumns } from "@/lib";
import { genreApi } from "@/api/genres";
import {
  IGenreCreateRequest,
  IGenreListRequest,
  IGenreResponseData,
  IGenreUpdateRequest,
} from "@/dtos/genres";
import { PAGINATION } from "@/common/constants";
import {
  genreKeys,
  useCreateGenre,
  useDeleteGenre,
  useGenresList,
  useUpdateGenre,
} from "../../react-query";
import { GenreFormModal } from "./GenreFormModal";

const { Search } = Input;

export function GenreListContainer() {
  const [queryParams, setQueryParams] = useState<IGenreListRequest>({
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    search: undefined,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGenre, setEditingGenre] = useState<IGenreResponseData | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useGenresList(queryParams);
  const { mutateAsync: createGenre, isPending: isCreating } = useCreateGenre();
  const { mutateAsync: updateGenre, isPending: isUpdating } = useUpdateGenre();
  const { mutateAsync: deleteGenre } = useDeleteGenre();

  const handleSearch = (value: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: value
        ? { fields: ["name", "description"], data: value }
        : undefined,
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

  const { getDefaultActions } = useTableColumns<IGenreResponseData>();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      fixed: "left" as const,
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 90,
      render: (imageUrl: string | null) => (
        <Avatar
          src={imageUrl}
          shape="square"
          size={40}
          icon={!imageUrl ? <PictureOutlined /> : undefined}
        />
      ),
    },
    {
      title: "Tên thể loại",
      dataIndex: "name",
      key: "name",
      width: 220,
      fixed: "left" as const,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 180,
    },
    {
      title: "Màu",
      dataIndex: "color",
      key: "color",
      width: 140,
      render: (color: string | null) =>
        color ? (
          <Tag color={color} icon={<BgColorsOutlined />}>
            {color}
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description: string | null) => description || "-",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (text: string) => (text ? dayjs(text).format("DD/MM/YYYY") : "-"),
    },
    getDefaultActions({
      onEdit: (record) => {
        setEditingGenre(record);
        setIsModalVisible(true);
      },
      onDelete: async (record) => {
        try {
          await deleteGenre(record.id);
          message.success("Xóa thể loại thành công");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa thể loại");
          console.error(error);
        }
      },
    }),
  ];

  const handleModalSubmit = async (
    values: IGenreCreateRequest | IGenreUpdateRequest,
  ) => {
    try {
      if (editingGenre) {
        await updateGenre({ id: editingGenre.id, data: values });
        message.success("Cập nhật thể loại thành công");
      } else {
        await createGenre(values as IGenreCreateRequest);
        message.success("Thêm thể loại thành công");
      }
      setIsModalVisible(false);
      setEditingGenre(null);
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      message.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingGenre(null);
  };

  const handleDeleteMany = async (keys: React.Key[]) => {
    try {
      await genreApi.deleteMany(keys as number[]);
      message.success(`Đã xóa ${keys.length} thể loại`);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa nhiều thể loại");
      console.error(error);
    }
  };

  return (
    <Flex $direction="column" $gap={24} style={{ width: "100%" }}>
      <Flex $justify="space-between" $align="center">
        <Search
          placeholder="Tìm kiếm theo tên, mô tả..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 320 }}
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingGenre(null);
            setIsModalVisible(true);
          }}
        >
          Thêm thể loại
        </Button>
      </Flex>

      <Table<IGenreResponseData>
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
            setEditingGenre(record);
            setIsModalVisible(true);
          },
          style: { cursor: "pointer" },
        })}
      />

      {isModalVisible && (
        <GenreFormModal
          visible={isModalVisible}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          initialValues={editingGenre}
          loading={isCreating || isUpdating}
        />
      )}
    </Flex>
  );
}

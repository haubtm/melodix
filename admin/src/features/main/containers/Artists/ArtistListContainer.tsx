"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Tag,
  message,
  Select,
  TablePaginationConfig,
  Avatar,
} from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Table, useTableColumns, Flex } from "@/lib";
import { ArtistFormModal } from "./ArtistFormModal";
import {
  useArtistsList,
  useCreateArtist,
  useUpdateArtist,
  useDeleteArtist,
} from "../../react-query";
import {
  IArtistResponseData,
  IArtistListRequest,
  IArtistCreateRequest,
  IArtistUpdateRequest,
} from "@/dtos/artists";
import dayjs from "dayjs";
import { artistApi } from "@/api/artists";
import { useQueryClient } from "@tanstack/react-query";
import { artistKeys } from "../../react-query/query-keys";
import { PAGINATION } from "@/common/constants";

const { Search } = Input;

export function ArtistListContainer() {
  const [queryParams, setQueryParams] = useState<IArtistListRequest>({
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    search: undefined,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingArtist, setEditingArtist] =
    useState<IArtistResponseData | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useArtistsList(queryParams);
  const { mutateAsync: createArtist, isPending: isCreating } =
    useCreateArtist();
  const { mutateAsync: updateArtist, isPending: isUpdating } =
    useUpdateArtist();
  const { mutateAsync: deleteArtist } = useDeleteArtist();

  const handleSearch = (value: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: value
        ? { fields: ["name", "slug", "bio"], data: value }
        : undefined,
      page: 1,
    }));
  };

  const handleFilterChange = (
    key: keyof IArtistListRequest,
    value: boolean | undefined,
  ) => {
    setQueryParams((prev) => ({
      ...prev,
      [key]: value ?? undefined,
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

  const { getDefaultActions } = useTableColumns<IArtistResponseData>();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      fixed: "left" as const,
    },
    {
      title: "Avatar",
      dataIndex: "avatarUrl",
      key: "avatarUrl",
      width: 80,
      render: (avatarUrl: string | null) => (
        <Avatar
          src={avatarUrl}
          icon={!avatarUrl ? <UserOutlined /> : undefined}
          size={40}
        />
      ),
    },
    {
      title: "Tên nghệ sĩ",
      dataIndex: "name",
      key: "name",
      fixed: "left" as const,
      width: 200,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 200,
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: 100,
      render: (userId: number | null) =>
        userId ? <Tag color="blue">#{userId}</Tag> : <Tag>Không có</Tag>,
    },
    {
      title: "Xác minh",
      dataIndex: "verified",
      key: "verified",
      width: 120,
      render: (verified: boolean) => (
        <Tag color={verified ? "success" : "default"}>
          {verified ? "Đã xác minh" : "Chưa"}
        </Tag>
      ),
    },
    {
      title: "Lượt nghe/tháng",
      dataIndex: "monthlyListeners",
      key: "monthlyListeners",
      width: 150,
      render: (count: number) => count?.toLocaleString() || "0",
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
        setEditingArtist(record);
        setIsModalVisible(true);
      },
      onDelete: async (record) => {
        try {
          await deleteArtist(record.id);
          message.success("Xóa nghệ sĩ thành công");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa nghệ sĩ");
          console.error(error);
        }
      },
    }),
  ];

  const handleModalSubmit = async (values: Record<string, unknown>) => {
    try {
      if (editingArtist) {
        const updateData: IArtistUpdateRequest = {
          name: values.name as string,
          slug: values.slug as string | undefined,
          bio: values.bio as string | undefined,
          avatarUrl: values.avatarUrl as string | undefined,
          coverUrl: values.coverUrl as string | undefined,
          verified: values.verified as boolean | undefined,
        };
        await updateArtist({ id: editingArtist.id, data: updateData });
        message.success("Cập nhật nghệ sĩ thành công");
      } else {
        const createData: IArtistCreateRequest = {
          userId: values.userId as number,
          name: values.name as string,
          slug: values.slug as string | undefined,
          bio: values.bio as string | undefined,
          avatarUrl: values.avatarUrl as string | undefined,
          coverUrl: values.coverUrl as string | undefined,
        };
        await createArtist(createData);
        message.success("Thêm nghệ sĩ thành công");
      }
      setIsModalVisible(false);
      setEditingArtist(null);
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      message.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingArtist(null);
  };

  const handleDeleteMany = async (keys: React.Key[]) => {
    try {
      await artistApi.deleteMany(keys as number[]);
      message.success(`Đã xóa ${keys.length} nghệ sĩ`);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() });
    } catch (err) {
      message.error("Có lỗi xảy ra khi xóa nhiều nghệ sĩ");
      console.error(err);
    }
  };

  return (
    <Flex $direction="column" $gap={24} style={{ width: "100%" }}>
      <Flex $justify="space-between" $align="center">
        <Flex $gap={16} $align="center">
          <Search
            placeholder="Tìm kiếm theo tên, slug..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Xác minh"
            allowClear
            onChange={(val) =>
              handleFilterChange(
                "verified",
                val === undefined ? undefined : val === "true",
              )
            }
            style={{ width: 150 }}
            options={[
              { label: "Đã xác minh", value: "true" },
              { label: "Chưa xác minh", value: "false" },
            ]}
          />
        </Flex>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingArtist(null);
            setIsModalVisible(true);
          }}
        >
          Thêm nghệ sĩ
        </Button>
      </Flex>

      <Table<IArtistResponseData>
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
            setEditingArtist(record);
            setIsModalVisible(true);
          },
          style: { cursor: "pointer" },
        })}
      />

      {isModalVisible && (
        <ArtistFormModal
          visible={isModalVisible}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          initialValues={editingArtist}
          loading={isCreating || isUpdating}
        />
      )}
    </Flex>
  );
}

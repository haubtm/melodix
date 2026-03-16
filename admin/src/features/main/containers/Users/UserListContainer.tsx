"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Tag,
  message,
  Select,
  TablePaginationConfig,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Table, useTableColumns, Flex } from "@/lib";
import { UserFormModal } from "./UserFormModal";
import {
  useUsersList,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../react-query";
import {
  IUserResponseData,
  IUserListRequest,
  IUserCreateRequest,
  IUserUpdateRequest,
} from "@/dtos/users";
import dayjs from "dayjs";
import { userApi } from "@/api/users";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "../../react-query/query-keys";
import { PAGINATION } from "@/common/constants";

const { Search } = Input;

export function UserListContainer() {
  const [queryParams, setQueryParams] = useState<IUserListRequest>({
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    search: undefined,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<IUserResponseData | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useUsersList(queryParams);
  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const handleSearch = (value: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: value
        ? { fields: ["displayName", "username", "email"], data: value }
        : undefined,
      page: 1,
    }));
  };

  const handleFilterChange = (
    key: keyof IUserListRequest,
    value: string | undefined,
  ) => {
    setQueryParams((prev) => ({
      ...prev,
      [key]: value || undefined,
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

  const { getDefaultActions } = useTableColumns<IUserResponseData>();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      fixed: "left" as const,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      fixed: "left" as const,
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
    },
    {
      title: "Tên hiển thị",
      dataIndex: "displayName",
      key: "displayName",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const color =
          role === "admin" ? "volcano" : role === "artist" ? "blue" : "green";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Loại gói",
      dataIndex: "subscriptionType",
      key: "subscriptionType",
      render: (type: string) => {
        const color =
          type === "premium"
            ? "gold"
            : type === "family"
              ? "purple"
              : "default";
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Hoạt động" : "Khóa"}
        </Tag>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (text: string) => (text ? dayjs(text).format("DD/MM/YYYY") : "-"),
    },
    getDefaultActions({
      onEdit: (record) => {
        setEditingUser(record);
        setIsModalVisible(true);
      },
      onDelete: async (record) => {
        try {
          await deleteUser(record.id);
          message.success("Xóa người dùng thành công");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa người dùng");
          console.error(error);
        }
      },
    }),
  ];

  const handleModalSubmit = async (values: Record<string, unknown>) => {
    try {
      if (editingUser) {
        const updateData: IUserUpdateRequest = {
          displayName: values.displayName as string,
          country: values.country as string,
          dateOfBirth: values.dateOfBirth as string,
        };
        await updateUser({ id: editingUser.id, data: updateData });
        message.success("Cập nhật người dùng thành công");
      } else {
        const createData: IUserCreateRequest = {
          email: values.email as string,
          password: values.password as string,
          username: values.username as string,
          displayName: values.displayName as string,
          role: values.role as "user" | "artist" | "admin",
          country: values.country as string,
          dateOfBirth: values.dateOfBirth as string,
        };
        await createUser(createData);
        message.success("Thêm người dùng thành công");
      }
      setIsModalVisible(false);
      setEditingUser(null);
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      message.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  const handleDeleteMany = async (keys: React.Key[]) => {
    try {
      await userApi.deleteMany(keys as number[]);
      message.success(`Đã xóa ${keys.length} người dùng`);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    } catch (err) {
      message.error("Có lỗi xảy ra khi xóa nhiều người dùng");
      console.error(err);
    }
  };

  return (
    <Flex $direction="column" $gap={24} style={{ width: "100%" }}>
      <Flex $justify="space-between" $align="center">
        <Flex $gap={16} $align="center">
          <Search
            placeholder="Tìm kiếm theo email, username..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Vai trò"
            allowClear
            onChange={(val) => handleFilterChange("role", val)}
            style={{ width: 150 }}
            options={[
              { label: "Admin", value: "admin" },
              { label: "Artist", value: "artist" },
              { label: "User", value: "user" },
            ]}
          />
        </Flex>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null);
            setIsModalVisible(true);
          }}
        >
          Thêm người dùng
        </Button>
      </Flex>

      <Table<IUserResponseData>
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
            setEditingUser(record);
            setIsModalVisible(true);
          },
          style: { cursor: "pointer" },
        })}
      />

      {isModalVisible && (
        <UserFormModal
          visible={isModalVisible}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          initialValues={editingUser}
          loading={isCreating || isUpdating}
        />
      )}
    </Flex>
  );
}

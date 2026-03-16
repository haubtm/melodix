"use client";

import React, { useState } from "react";
import { Button, Input, Space, Tag, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Table, useTableColumns } from "@/lib";
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
      search: value || undefined,
      page: 1,
    }));
  };

  const handleTableChange = (pagination: any) => {
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
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
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

  const handleModalSubmit = async (values: any) => {
    try {
      if (editingUser) {
        const updateData: IUserUpdateRequest = {
          displayName: values.displayName,
          country: values.country,
          dateOfBirth: values.dateOfBirth,
        };
        await updateUser({ id: editingUser.id, data: updateData });
        message.success("Cập nhật người dùng thành công");
      } else {
        const createData: IUserCreateRequest = {
          email: values.email,
          password: values.password,
          username: values.username,
          displayName: values.displayName,
          role: values.role,
          country: values.country,
          dateOfBirth: values.dateOfBirth,
        };
        await createUser(createData);
        message.success("Thêm người dùng thành công");
      }
      setIsModalVisible(false);
      setEditingUser(null);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra");
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
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Search
          placeholder="Tìm kiếm theo email, username..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
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
      </div>

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
      />

      <UserFormModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        initialValues={editingUser}
        loading={isCreating || isUpdating}
      />
    </Space>
  );
}

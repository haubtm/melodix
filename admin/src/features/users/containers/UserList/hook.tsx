"use client";

import { useState, useCallback } from "react";
import { App } from "antd";
import { IUserListRequest, IUserResponseData } from "@/dtos/users";
import {
  useUsersList,
  useDeleteUser,
  useCreateUser,
  useUpdateUser,
  useUploadFile,
} from "../../react-query";

export const useUserListContainer = () => {
  const { message, modal } = App.useApp();
  const [listParams, setListParams] = useState<IUserListRequest>({
    page: 1,
    limit: 10,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUserResponseData | null>(
    null,
  );

  const { data, isLoading, refetch } = useUsersList(listParams);
  const deleteMutation = useDeleteUser();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const uploadMutation = useUploadFile();

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setListParams((prev) => ({ ...prev, page, limit: pageSize }));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setListParams((prev) => ({
      ...prev,
      page: 1,
      search: value || undefined,
    }));
  }, []);

  const handleFilterRole = useCallback(
    (role: "user" | "artist" | "admin" | undefined) => {
      setListParams((prev) => ({ ...prev, page: 1, role }));
    },
    [],
  );

  const handleFilterSubscription = useCallback(
    (subscriptionType: "free" | "premium" | "family" | undefined) => {
      setListParams((prev) => ({ ...prev, page: 1, subscriptionType }));
    },
    [],
  );

  const handleDelete = useCallback(
    (user: IUserResponseData) => {
      modal.confirm({
        title: "Xác nhận xóa",
        content: `Bạn có chắc muốn xóa user "${user.displayName || user.username}"?`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            await deleteMutation.mutateAsync(user.id);
            message.success("Đã xóa user thành công");
          } catch {
            message.error("Xóa user thất bại");
          }
        },
      });
    },
    [deleteMutation, message, modal],
  );

  const handleOpenCreate = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((user: IUserResponseData) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
  }, []);

  return {
    data,
    isLoading,
    listParams,
    isModalOpen,
    editingUser,
    handlePageChange,
    handleSearch,
    handleFilterRole,
    handleFilterSubscription,
    handleDelete,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    refetch,
    createMutation,
    updateMutation,
    uploadMutation,
  };
};

"use client";

import React from "react";
import { App, Button, Popconfirm, Table as AntTable } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";
import type { TableProps } from "antd/es/table";

interface ActionColumnOptions<T> {
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
}

export function useTableColumns<T extends object>() {
  const getDefaultActions = (
    options: ActionColumnOptions<T>,
  ): ColumnType<T> => ({
    title: "Thao tác",
    key: "action",
    align: "center",
    fixed: "right",
    render: (_, record) => (
      <div
        style={{ display: "flex", gap: "8px", justifyContent: "center" }}
        onClick={(event) => event.stopPropagation()}
      >
        {options.onEdit && (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              options.onEdit?.(record);
            }}
            style={{ color: "#1890ff" }}
          />
        )}
        {options.onDelete && (
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            okText="Có"
            cancelText="Không"
            onConfirm={(event) => {
              event?.stopPropagation();
              options.onDelete?.(record);
            }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(event) => event.stopPropagation()}
            />
          </Popconfirm>
        )}
      </div>
    ),
  });

  return { getDefaultActions };
}

interface CommonTableProps<T> extends TableProps<T> {
  onDeleteMany?: (selectedRowKeys: React.Key[]) => void;
  selectedRowKeys?: React.Key[];
  setSelectedRowKeys?: (keys: React.Key[]) => void;
}

export default function Table<T extends object>({
  onDeleteMany,
  selectedRowKeys,
  setSelectedRowKeys,
  ...tableProps
}: CommonTableProps<T>) {
  const hasSelected = selectedRowKeys && selectedRowKeys.length > 0;
  const { modal } = App.useApp();

  const handleDeleteMany = () => {
    if (!selectedRowKeys || !onDeleteMany) return;

    modal.confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} mục đã chọn?`,
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk() {
        onDeleteMany(selectedRowKeys);
      },
    });
  };

  const rowSelection = setSelectedRowKeys
    ? {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
          setSelectedRowKeys(newSelectedRowKeys);
        },
      }
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {hasSelected && onDeleteMany && setSelectedRowKeys && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <Button danger icon={<DeleteOutlined />} onClick={handleDeleteMany}>
            Xóa ({selectedRowKeys?.length || 0}) mục đã chọn
          </Button>
        </div>
      )}
      <AntTable
        rowSelection={rowSelection}
        scroll={{ x: "max-content" }}
        {...tableProps}
      />
    </div>
  );
}

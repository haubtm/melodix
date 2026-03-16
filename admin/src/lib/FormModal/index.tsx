"use client";

import React, { useEffect } from "react";
import { Modal, Form, Spin } from "antd";
import type { FormInstance } from "antd/es/form";

interface CommonFormModalProps<T> {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: T) => void;
  initialValues?: Partial<T>;
  title: string;
  loading?: boolean;
  spinning?: boolean;
  formItems: React.ReactNode;
  form: FormInstance<T>;
  width?: number;
}

export default function FormModal<T extends object>({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  title,
  loading = false,
  spinning = false,
  formItems,
  form,
  width = 600,
}: CommonFormModalProps<T>) {
  useEffect(() => {
    if (visible) {
      if (initialValues) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setFieldsValue(initialValues as any);
      } else {
        form.resetFields();
      }
    } else {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={handleCancel}
      destroyOnHidden
      maskClosable={false}
      width={width}
    >
      <Spin spinning={spinning}>
        <Form
          form={form}
          layout="vertical"
          name="common_form_modal"
          initialValues={initialValues}
        >
          {formItems}
        </Form>
      </Spin>
    </Modal>
  );
}

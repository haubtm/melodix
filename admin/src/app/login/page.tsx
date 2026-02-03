"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Typography, Alert, App } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import styles from "./login.module.css";

const { Title, Text } = Typography;

interface LoginFormData {
  usernameOrEmail: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (tokens) => {
      // Save tokens first
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      try {
        // Get user profile
        const user = await authApi.getProfile();

        // Check if user has admin or artist role
        if (user.role !== "admin" && user.role !== "artist") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          message.error("Bạn không có quyền truy cập trang quản trị!");
          return;
        }

        dispatch(
          setCredentials({
            user: user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          }),
        );
        message.success("Đăng nhập thành công!");
        router.push("/dashboard");
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        message.error("Không thể lấy thông tin người dùng");
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Đăng nhập thất bại";
      message.error(msg);
    },
  });

  const onFinish = (values: LoginFormData) => {
    loginMutation.mutate(values);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg viewBox="0 0 24 24" width="48" height="48">
            <circle cx="12" cy="12" r="10" fill="#1890ff" />
            <path d="M8 15V9l8 3-8 3z" fill="white" />
          </svg>
          <Title level={3} className={styles.title}>
            Melodix Admin
          </Title>
        </div>

        <Text type="secondary" className={styles.subtitle}>
          Đăng nhập để quản lý nội dung
        </Text>

        <Alert
          title="Chỉ Admin và Nghệ sĩ mới có quyền truy cập"
          type="info"
          showIcon
          className={styles.alert}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="usernameOrEmail"
            label="Email hoặc Username"
            rules={[
              { required: true, message: "Vui lòng nhập email hoặc username" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="admin@melodix.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loginMutation.isPending}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

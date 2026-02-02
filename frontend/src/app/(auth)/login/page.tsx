"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Typography, Divider, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import styles from "../auth.module.css";

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );
      message.success("Đăng nhập thành công!");
      router.push("/");
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
      <motion.div
        className={styles.formCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <circle cx="12" cy="12" r="10" fill="#1DB954" />
            <path d="M8 15V9l8 3-8 3z" fill="white" />
          </svg>
          <Title level={2} className={styles.logoText}>
            Melodix
          </Title>
        </div>

        <Title level={3} className={styles.title}>
          Đăng nhập vào Melodix
        </Title>

        {/* Social Login */}
        <div className={styles.socialButtons}>
          <Button
            size="large"
            icon={<GoogleOutlined />}
            className={styles.socialButton}
            block
          >
            Tiếp tục với Google
          </Button>
          <Button
            size="large"
            icon={<FacebookOutlined />}
            className={styles.socialButton}
            block
          >
            Tiếp tục với Facebook
          </Button>
        </div>

        <Divider className={styles.divider}>hoặc</Divider>

        {/* Login Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.form}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email hoặc tên người dùng"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email hoặc tên người dùng"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <Form.Item className={styles.submitItem}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loginMutation.isPending}
              className={styles.submitButton}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          <Text className={styles.footerText}>
            Chưa có tài khoản?{" "}
            <Link href="/register" className={styles.link}>
              Đăng ký Melodix
            </Link>
          </Text>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Button, Typography, Divider, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { FaFacebookF } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { API_BASE_URL, authApi } from "@/api";
import { AppInput, AppPasswordInput } from "@/lib/Input";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useLogin } from "../../react-query";
import styles from "@/app/(auth)/auth.module.css";

const { Title, Text } = Typography;

interface LoginFormData {
  usernameOrEmail: string;
  password: string;
}

interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function LoginContainer() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<LoginFormData>();
  const loginMutation = useLogin();
  const handleOAuthLogin = (provider: "google" | "facebook") => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const onFinish = (values: LoginFormData) => {
    loginMutation.mutate(values, {
      onSuccess: async (data) => {
        try {
          const profile = await authApi.getProfile(data.accessToken);
          const { accessToken, refreshToken, ...user } = profile;

          dispatch(
            setCredentials({
              user,
              accessToken,
              refreshToken,
            }),
          );
          message.success("Đăng nhập thành công!");
          router.push("/");
        } catch {
          message.error("Đăng nhập thành công nhưng không tải được hồ sơ người dùng");
        }
      },
      onError: (error) => {
        const typedError = error as ApiErrorShape;
        const msg = typedError.response?.data?.message || "Đăng nhập thất bại";
        message.error(msg);
      },
    });
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.formCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
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

        <div className={styles.socialButtons}>
          <Button
            size="large"
            icon={<FcGoogle className={styles.socialIcon} />}
            className={styles.socialButton}
            block
            onClick={() => handleOAuthLogin("google")}
          >
            Tiếp tục với Google
          </Button>
          <Button
            size="large"
            icon={
              <span className={`${styles.socialIcon} ${styles.facebookIcon}`}>
                <FaFacebookF />
              </span>
            }
            className={styles.socialButton}
            block
            onClick={() => handleOAuthLogin("facebook")}
          >
            Tiếp tục với Facebook
          </Button>
        </div>

        <Divider className={styles.divider}>hoặc</Divider>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.form}
          requiredMark={false}
        >
          <Form.Item
            name="usernameOrEmail"
            label="Email hoặc tên người dùng"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email hoặc tên người dùng",
              },
            ]}
          >
            <AppInput
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
            <AppPasswordInput
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

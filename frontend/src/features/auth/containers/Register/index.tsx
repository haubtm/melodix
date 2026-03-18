"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Typography, Divider, message, Steps } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebookF } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { API_BASE_URL, authApi } from "@/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useRegister, useVerifyEmail } from "../../react-query";
import styles from "@/app/(auth)/auth.module.css";

const { Title, Text } = Typography;

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface VerifyFormData {
  otpCode: string;
}

interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function RegisterContainer() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [registerForm] = Form.useForm<RegisterFormData>();
  const [verifyForm] = Form.useForm<VerifyFormData>();
  const registerMutation = useRegister();
  const verifyMutation = useVerifyEmail();
  const handleOAuthLogin = (provider: "google" | "facebook") => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const onRegisterFinish = (values: RegisterFormData) => {
    setEmail(values.email);
    registerMutation.mutate(
      {
        email: values.email,
        username: values.username,
        password: values.password,
      },
      {
        onSuccess: () => {
          message.success("Mã OTP đã được gửi đến email của bạn");
          setCurrentStep(1);
        },
        onError: (error) => {
          const typedError = error as ApiErrorShape;
          const msg = typedError.response?.data?.message || "Đăng ký thất bại";
          message.error(msg);
        },
      },
    );
  };

  const onVerifyFinish = (values: VerifyFormData) => {
    verifyMutation.mutate(
      {
        email,
        otpCode: values.otpCode,
      },
      {
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
            message.success("Xác thực thành công! Chào mừng bạn đến với Melodix");
            router.push("/");
          } catch {
            message.error("Xác thực thành công nhưng không tải được hồ sơ người dùng");
          }
        },
        onError: (error) => {
          const typedError = error as ApiErrorShape;
          const msg = typedError.response?.data?.message || "Mã OTP không hợp lệ";
          message.error(msg);
        },
      },
    );
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
          Đăng ký tài khoản
        </Title>

        <Steps
          current={currentStep}
          className={styles.steps}
          items={[{ title: "Thông tin" }, { title: "Xác thực" }]}
        />

        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className={styles.socialButtons}>
                <Button
                  size="large"
                  icon={<FcGoogle className={styles.socialIcon} />}
                  className={styles.socialButton}
                  block
                  onClick={() => handleOAuthLogin("google")}
                >
                  Đăng ký với Google
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
                  Đăng ký với Facebook
                </Button>
              </div>

              <Divider className={styles.divider}>hoặc đăng ký với email</Divider>

              <Form
                form={registerForm}
                layout="vertical"
                onFinish={onRegisterFinish}
                className={styles.form}
                requiredMark={false}
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập email của bạn"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="username"
                  label="Tên người dùng"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên người dùng" },
                    {
                      min: 3,
                      message: "Tên người dùng phải có ít nhất 3 ký tự",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Chọn tên người dùng"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Tạo mật khẩu"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Mật khẩu không khớp"));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập lại mật khẩu"
                    size="large"
                  />
                </Form.Item>

                <Form.Item className={styles.submitItem}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={registerMutation.isPending}
                    className={styles.submitButton}
                  >
                    Tiếp tục
                  </Button>
                </Form.Item>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className={styles.verifyInfo}>
                <SafetyCertificateOutlined className={styles.verifyIcon} />
                <Text className={styles.verifyText}>
                  Chúng tôi đã gửi mã xác thực đến <strong>{email}</strong>
                </Text>
              </div>

              <Form
                form={verifyForm}
                layout="vertical"
                onFinish={onVerifyFinish}
                className={styles.form}
                requiredMark={false}
              >
                <Form.Item
                  name="otpCode"
                  label="Mã xác thực OTP"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã OTP" },
                    { len: 6, message: "Mã OTP phải có 6 số" },
                  ]}
                >
                  <Input
                    placeholder="Nhập mã 6 số"
                    size="large"
                    maxLength={6}
                    className={styles.otpInput}
                  />
                </Form.Item>

                <Form.Item className={styles.submitItem}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={verifyMutation.isPending}
                    className={styles.submitButton}
                  >
                    Xác thực
                  </Button>
                </Form.Item>

                <Button
                  type="link"
                  onClick={() => setCurrentStep(0)}
                  className={styles.backButton}
                >
                  ← Quay lại
                </Button>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.footer}>
          <Text className={styles.footerText}>
            Đã có tài khoản?{" "}
            <Link href="/login" className={styles.link}>
              Đăng nhập
            </Link>
          </Text>
        </div>
      </motion.div>
    </div>
  );
}

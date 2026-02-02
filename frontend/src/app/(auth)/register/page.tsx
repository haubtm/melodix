"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Typography, Divider, message, Steps } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  GoogleOutlined,
  FacebookOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import styles from "../auth.module.css";

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

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [registerForm] = Form.useForm();
  const [verifyForm] = Form.useForm();

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      message.success("Mã OTP đã được gửi đến email của bạn");
      setCurrentStep(1);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Đăng ký thất bại";
      message.error(msg);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );
      message.success("Xác thực thành công! Chào mừng bạn đến với Melodix");
      router.push("/");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Mã OTP không hợp lệ";
      message.error(msg);
    },
  });

  const onRegisterFinish = (values: RegisterFormData) => {
    setEmail(values.email);
    registerMutation.mutate({
      email: values.email,
      username: values.username,
      password: values.password,
    });
  };

  const onVerifyFinish = (values: VerifyFormData) => {
    verifyMutation.mutate({
      email,
      otpCode: values.otpCode,
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
          Đăng ký tài khoản
        </Title>

        {/* Steps */}
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
              {/* Social Signup */}
              <div className={styles.socialButtons}>
                <Button
                  size="large"
                  icon={<GoogleOutlined />}
                  className={styles.socialButton}
                  block
                >
                  Đăng ký với Google
                </Button>
                <Button
                  size="large"
                  icon={<FacebookOutlined />}
                  className={styles.socialButton}
                  block
                >
                  Đăng ký với Facebook
                </Button>
              </div>

              <Divider className={styles.divider}>
                hoặc đăng ký với email
              </Divider>

              {/* Register Form */}
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

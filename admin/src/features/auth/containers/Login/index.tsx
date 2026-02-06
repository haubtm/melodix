"use client";

import React from "react";
import { Form, Input, Button, Alert, Card } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import * as S from "./styles";
import { useLoginContainer } from "./hook";

export const LoginContainer = () => {
  const { form, handleLogin, isLoading } = useLoginContainer();

  return (
    <S.Root>
      <Card style={{ width: "100%", maxWidth: 400, borderRadius: 12 }}>
        <S.Logo>
          <svg viewBox="0 0 24 24" width="48" height="48">
            <circle cx="12" cy="12" r="10" fill="#1890ff" />
            <path d="M8 15V9l8 3-8 3z" fill="white" />
          </svg>
          <S.Title>Melodix Admin</S.Title>
        </S.Logo>

        <S.Subtitle>Đăng nhập để quản lý nội dung</S.Subtitle>

        <S.AlertWrapper>
          <Alert
            message="Chỉ Admin và Nghệ sĩ mới có quyền truy cập"
            type="info"
            showIcon
          />
        </S.AlertWrapper>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
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
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </S.Root>
  );
};

export default LoginContainer;

"use client";

import { useRouter } from "next/navigation";
import { Form, App } from "antd";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useLogin, useProfile } from "../../react-query";
import { LoginRequest } from "@/dtos";

import { STORAGE_KEY } from "@/common/constants";

export const useLoginContainer = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const loginMutation = useLogin();
  const profileMutation = useProfile();

  const handleLogin = async (values: LoginRequest) => {
    try {
      const tokens = await loginMutation.mutateAsync(values);

      // Save tokens first
      localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEY.REFRESH_TOKEN, tokens.refreshToken);

      // Get user profile
      const user = await profileMutation.mutateAsync();

      // Check if user has admin or artist role
      if (user.role !== "admin" && user.role !== "artist") {
        localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEY.REFRESH_TOKEN);
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
    } catch (error: any) {
      localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEY.REFRESH_TOKEN);
      const msg = error?.message || "Đăng nhập thất bại";
      message.error(msg);
    }
  };

  return {
    form,
    handleLogin,
    isLoading: loginMutation.isPending || profileMutation.isPending,
  };
};

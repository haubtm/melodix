"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spin, message } from "antd";
import { authApi } from "@/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

export default function AuthCallbackContainer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let isMounted = true;

    const completeOAuthLogin = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      if (!accessToken || !refreshToken) {
        message.error("Thiếu dữ liệu đăng nhập từ nhà cung cấp");
        router.replace("/login");
        return;
      }

      try {
        const profile = await authApi.getProfile(accessToken);

        if (!isMounted) return;

        const {
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
          ...user
        } = profile;

        dispatch(
          setCredentials({
            user,
            accessToken: nextAccessToken || accessToken,
            refreshToken: nextRefreshToken || refreshToken,
          }),
        );

        message.success("Đăng nhập thành công!");
        router.replace("/");
      } catch {
        if (!isMounted) return;
        message.error("Không thể hoàn tất đăng nhập mạng xã hội");
        router.replace("/login");
      }
    };

    completeOAuthLogin();

    return () => {
      isMounted = false;
    };
  }, [dispatch, router, searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#121212",
      }}
    >
      <Spin size="large" tip="Đang hoàn tất đăng nhập..." />
    </div>
  );
}

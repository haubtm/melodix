import { ProtectedPageShell } from "@/features";

export default function SettingsPage() {
  return (
    <ProtectedPageShell
      title="Cài đặt"
      description="Đây là khu vực riêng tư để quản lý cài đặt tài khoản, bảo mật và tùy chọn trải nghiệm nghe nhạc."
    />
  );
}

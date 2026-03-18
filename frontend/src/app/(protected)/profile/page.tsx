import { ProtectedPageShell } from "@/features";

export default function ProfilePage() {
  return (
    <ProtectedPageShell
      title="Hồ sơ"
      description="Đây là khu vực riêng tư cho tài khoản của bạn. Phần thông tin hồ sơ chi tiết sẽ được triển khai tại đây."
    />
  );
}

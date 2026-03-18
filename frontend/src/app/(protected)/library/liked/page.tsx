import { ProtectedPageShell } from "@/features";

export default function LikedSongsPage() {
  return (
    <ProtectedPageShell
      title="Bài hát yêu thích"
      description="Đây là danh sách bài hát đã thích của bạn. Route này hiện đã được bảo vệ bởi auth guard và sẵn sàng để nối API thật."
    />
  );
}

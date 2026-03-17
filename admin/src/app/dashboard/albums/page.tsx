import { Metadata } from "next";
import { AlbumListContainer } from "@/features/main";

export const metadata: Metadata = {
  title: "Quản lý album - Admin Panel",
  description: "Quản lý danh sách album",
};

export default function AlbumsPage() {
  return (
    <div>
      <AlbumListContainer />
    </div>
  );
}

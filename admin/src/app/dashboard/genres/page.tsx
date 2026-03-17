import { Metadata } from "next";
import { GenreListContainer } from "@/features/main";

export const metadata: Metadata = {
  title: "Quản lý thể loại - Admin Panel",
  description: "Quản lý danh sách thể loại",
};

export default function GenresPage() {
  return (
    <div>
      <GenreListContainer />
    </div>
  );
}

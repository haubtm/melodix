import { Metadata } from "next";
import { ArtistListContainer } from "@/features/main";

export const metadata: Metadata = {
  title: "Quản lý nghệ sĩ - Admin Panel",
  description: "Quản lý danh sách nghệ sĩ",
};

export default function ArtistsPage() {
  return (
    <div>
      <ArtistListContainer />
    </div>
  );
}

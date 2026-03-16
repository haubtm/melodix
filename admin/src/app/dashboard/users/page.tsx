import { Metadata } from "next";
import { UserListContainer } from "@/features/main";

export const metadata: Metadata = {
  title: "Quản lý người dùng - Admin Panel",
  description: "Quản lý danh sách người dùng",
};

export default function UsersPage() {
  return (
    <div>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 600,
          marginBottom: "24px",
          color: "#1f2937",
        }}
      >
        Quản lý người dùng
      </h1>
      <UserListContainer />
    </div>
  );
}

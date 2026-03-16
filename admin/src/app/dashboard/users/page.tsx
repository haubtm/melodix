import { Metadata } from "next";
import { UserListContainer } from "@/features/main";

export const metadata: Metadata = {
  title: "Quản lý người dùng - Admin Panel",
  description: "Quản lý danh sách người dùng",
};

export default function UsersPage() {
  return (
    <div>
      <UserListContainer />
    </div>
  );
}

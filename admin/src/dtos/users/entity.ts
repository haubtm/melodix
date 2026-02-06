export type UserRole = "user" | "artist" | "admin";

export interface User {
  id: number;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  country?: string;
  subscriptionType: "free" | "premium" | "family";
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

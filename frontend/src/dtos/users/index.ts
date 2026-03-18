export interface User {
  id: number;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  country?: string;
  subscriptionType: "free" | "premium" | "family";
  role: "user" | "artist" | "admin";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

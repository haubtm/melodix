export const ROUTE_PATH = {
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: {
    HOME: "/dashboard",
    SONGS: "/dashboard/songs",
    ALBUMS: "/dashboard/albums",
    USERS: "/dashboard/users",
    APPROVALS: "/dashboard/approvals",
  },
} as const;

export const STORAGE_KEY = {
  TOKEN: "token",
  USER: "user",
} as const;

export const CONTENT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  REJECTED: "rejected",
} as const;

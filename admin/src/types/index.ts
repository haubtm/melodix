// User types
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

export type UserRole = "user" | "artist" | "admin";

// Artist types
export interface Artist {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  country?: string;
  verified: boolean;
  monthlyListeners: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

// Genre types
export interface Genre {
  id: number;
  name: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  color?: string;
}

// Album types
export interface Album {
  id: number;
  title: string;
  slug: string;
  artistId: number;
  artist?: Artist;
  albumType: "album" | "single" | "ep" | "compilation";
  coverUrl?: string;
  releaseDate?: string;
  totalTracks: number;
  durationMs: number;
  description?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

// Song types
export interface Song {
  id: number;
  title: string;
  slug: string;
  albumId?: number;
  album?: Album;
  artistId: number;
  artist?: Artist;
  genreId?: number;
  genre?: Genre;
  trackNumber?: number;
  durationMs: number;
  audioUrl: string;
  audioPreviewUrl?: string;
  coverUrl?: string;
  lyrics?: string;
  playCount: number;
  explicit: boolean;
  status: ContentStatus;
  rejectionReason?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Content status for approval workflow
export type ContentStatus = "draft" | "pending" | "published" | "rejected";

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalSongs: number;
  totalAlbums: number;
  totalArtists: number;
  pendingApprovals: number;
  totalPlays: number;
  userGrowth: number;
  playGrowth: number;
}

export interface ArtistDashboardStats {
  totalSongs: number;
  totalAlbums: number;
  totalPlays: number;
  pendingCount: number;
  publishedCount: number;
  rejectedCount: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Menu item for sidebar
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  roles?: UserRole[];
}

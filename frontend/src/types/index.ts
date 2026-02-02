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
  role: "user" | "artist" | "admin";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface VerifyEmailRequest {
  email: string;
  otpCode: string;
}

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
  isPublished: boolean;
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
  isPublished: boolean;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Playlist types
export interface Playlist {
  id: number;
  userId: number;
  name: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  totalTracks: number;
  durationMs: number;
  songs?: Song[];
  createdAt: string;
  updatedAt: string;
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

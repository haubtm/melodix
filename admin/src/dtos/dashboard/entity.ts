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

// Menu item for sidebar
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  roles?: ("user" | "artist" | "admin")[];
}

// API Error
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface UpdateSongRequest {
  title?: string;
  artistId?: number;
  albumId?: number;
  genreIds?: number[];
  coverUrl?: string;
  explicit?: boolean;
  lyrics?: string;
  status?: "draft" | "pending" | "published" | "rejected";
  rejectionReason?: string;
}

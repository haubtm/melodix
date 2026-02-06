export interface CreateSongRequest {
  title: string;
  artistId: number;
  albumId?: number;
  genreIds?: number[];
  durationMs: number;
  audioUrl: string;
  coverUrl?: string;
  explicit?: boolean;
  lyrics?: string;
}

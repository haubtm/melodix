export interface CreateSongRequest {
  title: string;
  artistId: number;
  albumId?: number;
  trackNumber?: number;
  durationMs: number;
  audioUrl: string;
  coverUrl?: string;
  lyricsUrl?: string;
  genreIds?: number[];
  featuredArtistIds?: number[];
}

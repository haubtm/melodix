export type SongStatus = "pending" | "approved" | "rejected";

export interface ISongArtistReference {
  id: number;
  name: string;
  userId?: number;
}

export interface ISongAlbumReference {
  id: number;
  title: string;
}

export interface ISongGenreReference {
  id: number;
  name: string;
}

export interface ISongFeaturedArtistReference {
  artist: ISongArtistReference;
  role: string;
}

export interface Song {
  id: number;
  title: string;
  slug: string;
  durationMs: number;
  trackNumber?: number | null;
  audioUrl: string;
  coverUrl?: string | null;
  lyricsUrl?: string | null;
  playCount: number;
  createdAt: string;
  status: SongStatus;
  albumId?: number;
  primaryArtistId?: number;
  primaryArtist?: ISongArtistReference;
  album?: ISongAlbumReference | null;
  genres?: Array<{ genre: ISongGenreReference }>;
  songArtists?: ISongFeaturedArtistReference[];
}

import { Album } from "../albums";
import { Artist } from "../artists";
import { Genre } from "../genres";

export interface SongPrimaryArtistReference {
  id: number;
  name: string;
}

export interface SongGenreReference {
  genre: Genre;
}

export interface SongArtistReference {
  artist: Artist;
  role?: string;
}

export interface Song {
  id: number;
  title: string;
  slug: string;
  albumId?: number;
  album?: Album | null;
  artistId: number;
  artist?: Artist;
  primaryArtist?: SongPrimaryArtistReference;
  genreId?: number;
  genre?: Genre;
  genres?: SongGenreReference[];
  songArtists?: SongArtistReference[];
  trackNumber?: number;
  durationMs: number;
  audioUrl: string;
  audioPreviewUrl?: string;
  coverUrl?: string;
  lyricsUrl?: string;
  lyrics?: string;
  playCount: number;
  explicit: boolean;
  isPublished: boolean;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

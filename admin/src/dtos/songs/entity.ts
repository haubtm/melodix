import { Album, ContentStatus } from "../albums";
import { Artist } from "../artists";
import { Genre } from "../genres";

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

export type { ContentStatus };

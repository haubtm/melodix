import { Song, SongStatus } from '@prisma/client';

export class SongEntity implements Song {
  id: number;
  albumId: number | null;
  artistId: number;
  title: string;
  slug: string;
  trackNumber: number | null;
  discNumber: number;
  durationMs: number;
  audioUrl: string;
  coverUrl: string | null;
  previewUrl: string | null;
  lyricsUrl: string | null;
  isExplicit: boolean;
  isPlayable: boolean;
  playCount: bigint;
  status: SongStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  reviewedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

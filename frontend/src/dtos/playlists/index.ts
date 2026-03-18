import { Song } from "../songs";

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

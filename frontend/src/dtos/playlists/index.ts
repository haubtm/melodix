import { Song } from "../songs";
import { User } from "../users";

export interface PlaylistSong {
  id: number;
  song: Song;
  position: number;
  addedAt: string;
  addedBy?: number | null;
}

export interface Playlist {
  id: number;
  userId?: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  coverUrl?: string | null;
  isPublic: boolean;
  isCollaborative?: boolean;
  totalTracks: number;
  durationMs: number;
  songs?: PlaylistSong[];
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  imageUrl?: string;
}


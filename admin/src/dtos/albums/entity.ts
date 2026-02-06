import { Artist } from "../artists";

export type ContentStatus = "draft" | "pending" | "published" | "rejected";

export interface Album {
  id: number;
  title: string;
  slug: string;
  artistId: number;
  artist?: Artist;
  albumType: "album" | "single" | "ep" | "compilation";
  coverUrl?: string;
  releaseDate?: string;
  totalTracks: number;
  durationMs: number;
  description?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

import { Artist } from "../artists";

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
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

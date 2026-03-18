import { Song } from "../songs";

export interface RecordPlayRequest {
  songId: number;
  durationMs?: number;
  contextType?: "album" | "playlist" | "artist" | "search" | "radio";
  contextId?: number;
}

export interface RecentlyPlayedItem {
  playedAt: string;
  contextType?: "album" | "playlist" | "artist" | "search" | "radio";
  contextId?: number;
  song: Song;
}

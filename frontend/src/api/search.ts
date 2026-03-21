import { Album, Artist, Playlist, Song } from "@/dtos";
import { axiosService } from "./axiosService";

export interface SearchResults {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

interface SearchParams {
  query: string;
  songLimit?: number;
  artistLimit?: number;
  albumLimit?: number;
  playlistLimit?: number;
}

export async function searchAll({
  query,
  songLimit = 8,
  artistLimit = 6,
  albumLimit = 6,
  playlistLimit = 6,
}: SearchParams): Promise<SearchResults> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      songs: [],
      artists: [],
      albums: [],
      playlists: [],
    };
  }

  const response = await axiosService.get("/search", {
    params: {
      q: trimmedQuery,
      songsLimit: songLimit,
      artistsLimit: artistLimit,
      albumsLimit: albumLimit,
      playlistsLimit: playlistLimit,
    },
  });

  const payload = response.data?.data || response.data;

  return {
    songs: payload?.songs || [],
    artists: payload?.artists || [],
    albums: payload?.albums || [],
    playlists: payload?.playlists || [],
  };
}

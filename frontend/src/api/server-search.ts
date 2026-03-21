import "server-only";

import { Album, Artist, IPaginatedResponse, Playlist, Song } from "@/dtos";
import { serverGet, serverPost } from "./server";

export interface ServerSearchResults {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

function toQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

export const serverSearchApi = {
  searchAll: async (
    query: string,
    limits: {
      songs?: number;
      artists?: number;
      albums?: number;
      playlists?: number;
    } = {},
  ): Promise<ServerSearchResults> => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return {
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
      };
    }

    const {
      songs = 8,
      artists = 6,
      albums = 6,
      playlists = 6,
    } = limits;

    try {
      const response = await serverGet<{
        data?: ServerSearchResults;
        songs?: Song[];
        artists?: Artist[];
        albums?: Album[];
        playlists?: Playlist[];
      }>(
        `/search${toQueryString({
          q: trimmedQuery,
          songsLimit: songs,
          artistsLimit: artists,
          albumsLimit: albums,
          playlistsLimit: playlists,
        })}`,
        { next: { revalidate: 60 } },
      );

      const payload = ("data" in response && response.data ? response.data : response) as
        | ServerSearchResults
        | {
            songs?: Song[];
            artists?: Artist[];
            albums?: Album[];
            playlists?: Playlist[];
          };

      return {
        songs: payload.songs || [],
        artists: payload.artists || [],
        albums: payload.albums || [],
        playlists: payload.playlists || [],
      };
    } catch {
      const [songsResult, artistsResult, albumsResult, playlistsResult] =
        await Promise.allSettled([
          serverPost<IPaginatedResponse<Song>>(
            "/songs/list",
            {
              limit: songs,
              search: {
                fields: ["title"],
                data: trimmedQuery,
              },
            },
            { next: { revalidate: 60 } },
          ),
          serverPost<IPaginatedResponse<Artist>>(
            "/artists/list",
            {
              limit: artists,
              search: {
                fields: ["name", "slug", "bio"],
                data: trimmedQuery,
              },
            },
            { next: { revalidate: 60 } },
          ),
          serverGet<IPaginatedResponse<Album>>(
            `/albums${toQueryString({ search: trimmedQuery, limit: albums })}`,
            { next: { revalidate: 60 } },
          ),
          serverGet<IPaginatedResponse<Playlist>>(
            `/playlists${toQueryString({
              search: trimmedQuery,
              limit: playlists,
            })}`,
            { next: { revalidate: 60 } },
          ),
        ]);

      return {
        songs:
          songsResult.status === "fulfilled" ? songsResult.value.data || [] : [],
        artists:
          artistsResult.status === "fulfilled"
            ? artistsResult.value.data || []
            : [],
        albums:
          albumsResult.status === "fulfilled" ? albumsResult.value.data || [] : [],
        playlists:
          playlistsResult.status === "fulfilled"
            ? playlistsResult.value.data || []
            : [],
      };
    }
  },

  getBrowsePlaylists: async (limit: number = 6): Promise<Playlist[]> => {
    const response = await serverGet<IPaginatedResponse<Playlist>>(
      `/playlists${toQueryString({ limit })}`,
      { next: { revalidate: 120 } },
    );

    return response.data || [];
  },
};

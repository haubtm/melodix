import "server-only";

import { IPaginatedResponse, Album, Artist, Song } from "@/dtos";
import { type AlbumQueryParams } from "./albums";
import { type ArtistListParams } from "./artists";
import { type SongQueryParams } from "./songs";
import { serverGet, serverPost } from "./server";

function toQueryString(
  params: Record<string, string | number | undefined> | object,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params as Record<string, string | number | undefined>).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    },
  );

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

export const homeApi = {
  getSongs: async (
    params: SongQueryParams = {},
  ): Promise<IPaginatedResponse<Song>> => {
    return serverGet<IPaginatedResponse<Song>>(
      `/songs${toQueryString(params)}`,
      { next: { revalidate: 300 } },
    );
  },

  getAlbums: async (
    params: AlbumQueryParams = {},
  ): Promise<IPaginatedResponse<Album>> => {
    return serverGet<IPaginatedResponse<Album>>(
      `/albums${toQueryString(params)}`,
      { next: { revalidate: 300 } },
    );
  },

  getArtists: async (
    params: ArtistListParams = {},
  ): Promise<IPaginatedResponse<Artist>> => {
    return serverPost<IPaginatedResponse<Artist>>("/artists/list", params, {
      next: { revalidate: 300 },
    });
  },
};

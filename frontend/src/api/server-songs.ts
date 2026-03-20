import "server-only";

import { Artist, Genre, IPaginatedResponse, Song } from "@/dtos";
import { serverGet, serverPost } from "./server";
import { type SongQueryParams } from "./songs";

export const serverSongsApi = {
  getSongs: async (
    params: SongQueryParams = {},
  ): Promise<IPaginatedResponse<Song>> => {
    return serverPost<IPaginatedResponse<Song>>("/songs/list", params, {
      next: { revalidate: 120 },
    });
  },

  getArtists: async (limit: number = 50): Promise<IPaginatedResponse<Artist>> => {
    return serverPost<IPaginatedResponse<Artist>>(
      "/artists/list",
      { limit },
      { next: { revalidate: 300 } },
    );
  },

  getGenres: async (limit: number = 50): Promise<IPaginatedResponse<Genre>> => {
    return serverGet<IPaginatedResponse<Genre>>(`/genres?page=1&limit=${limit}`, {
      next: { revalidate: 300 },
    });
  },
};


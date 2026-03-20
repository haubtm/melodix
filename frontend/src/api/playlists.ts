import { CreatePlaylistRequest, IPaginatedResponse, Playlist } from "@/dtos";
import { axiosService } from "./axiosService";

export interface PlaylistQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

function unwrapPaginated<T>(
  payload: IPaginatedResponse<T> | { data: IPaginatedResponse<T> },
): IPaginatedResponse<T> {
  return ("data" in payload && !Array.isArray(payload.data) ? payload.data : payload) as IPaginatedResponse<T>;
}

function unwrapEntity<T extends object>(payload: T | { data: T }): T {
  return ("data" in payload ? payload.data : payload) as T;
}

function normalizePlaylist(playlist: Playlist): Playlist {
  return {
    ...playlist,
    coverUrl: playlist.coverUrl || playlist.imageUrl || undefined,
  };
}

export const playlistsApi = {
  getAll: async (
    params: PlaylistQueryParams = {},
  ): Promise<IPaginatedResponse<Playlist>> => {
    const response = await axiosService.get("/playlists", { params });
    const payload = unwrapPaginated<Playlist>(response.data);

    return {
      ...payload,
      data: (payload.data || []).map(normalizePlaylist),
    };
  },

  getMine: async (
    page: number = 1,
    limit: number = 50,
  ): Promise<IPaginatedResponse<Playlist>> => {
    const response = await axiosService.get("/playlists/my", {
      params: { page, limit },
    });
    const payload = unwrapPaginated<Playlist>(response.data);

    return {
      ...payload,
      data: (payload.data || []).map(normalizePlaylist),
    };
  },

  getById: async (id: number): Promise<Playlist> => {
    const response = await axiosService.get(`/playlists/${id}`);
    return normalizePlaylist(unwrapEntity<Playlist>(response.data));
  },

  create: async (payload: CreatePlaylistRequest): Promise<Playlist> => {
    const response = await axiosService.post("/playlists", payload);
    return normalizePlaylist(unwrapEntity<Playlist>(response.data));
  },

  addSongs: async (playlistId: number, songIds: number[]): Promise<void> => {
    await axiosService.post(`/playlists/${playlistId}/songs`, { songIds });
  },

  removeSong: async (playlistId: number, songId: number): Promise<void> => {
    await axiosService.delete(`/playlists/${playlistId}/songs/${songId}`);
  },
};


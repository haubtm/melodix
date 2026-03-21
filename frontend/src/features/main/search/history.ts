import { Album, Artist, Playlist, Song } from "@/dtos";

export type SearchHistoryType = "query" | "song" | "artist" | "album" | "playlist";

export interface SearchHistoryItem {
  id: string;
  type: SearchHistoryType;
  title: string;
  subtitle: string;
  href: string;
  query: string;
  imageUrl?: string;
  createdAt: number;
}

const STORAGE_KEY = "melodix:search-history";
const MAX_ITEMS = 8;

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSearchHistory(): SearchHistoryItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as SearchHistoryItem[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function clearSearchHistory() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

export function saveSearchHistoryItem(item: SearchHistoryItem) {
  if (!isBrowser()) {
    return;
  }

  const nextItems = [
    item,
    ...getSearchHistory().filter(
      (existingItem) =>
        !(
          existingItem.type === item.type &&
          existingItem.href === item.href &&
          existingItem.title === item.title
        ),
    ),
  ].slice(0, MAX_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
}

export function createQueryHistoryItem(query: string): SearchHistoryItem {
  const trimmedQuery = query.trim();

  return {
    id: `query-${trimmedQuery.toLowerCase()}`,
    type: "query",
    title: trimmedQuery,
    subtitle: "Tìm kiếm",
    href: `/search?q=${encodeURIComponent(trimmedQuery)}`,
    query: trimmedQuery,
    createdAt: Date.now(),
  };
}

export function createSongHistoryItem(song: Song): SearchHistoryItem {
  const artistName = song.artist?.name || song.primaryArtist?.name || "Unknown Artist";

  return {
    id: `song-${song.id}`,
    type: "song",
    title: song.title,
    subtitle: `Bài hát • ${artistName}`,
    href: `/song/${song.id}`,
    query: song.title,
    imageUrl: song.coverUrl || song.album?.coverUrl,
    createdAt: Date.now(),
  };
}

export function createArtistHistoryItem(artist: Artist): SearchHistoryItem {
  return {
    id: `artist-${artist.id}`,
    type: "artist",
    title: artist.name,
    subtitle: "Nghệ sĩ",
    href: `/artist/${artist.id}`,
    query: artist.name,
    imageUrl: artist.avatarUrl,
    createdAt: Date.now(),
  };
}

export function createAlbumHistoryItem(album: Album): SearchHistoryItem {
  return {
    id: `album-${album.id}`,
    type: "album",
    title: album.title,
    subtitle: `Album • ${album.artist?.name || "Melodix"}`,
    href: `/album/${album.id}`,
    query: album.title,
    imageUrl: album.coverUrl,
    createdAt: Date.now(),
  };
}

export function createPlaylistHistoryItem(playlist: Playlist): SearchHistoryItem {
  return {
    id: `playlist-${playlist.id}`,
    type: "playlist",
    title: playlist.name,
    subtitle: `Playlist • ${playlist.owner?.displayName || playlist.owner?.username || "Melodix"}`,
    href: `/playlist/${playlist.id}`,
    query: playlist.name,
    imageUrl: playlist.coverUrl || playlist.imageUrl || undefined,
    createdAt: Date.now(),
  };
}

import type { Metadata } from "next";
import { homeApi } from "@/api/server-home";
import { serverSearchApi } from "@/api/server-search";
import { SITE_CONFIG } from "@/common/seo";
import { SearchPageContainer } from "@/features/main/containers/Search";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  if (!query) {
    return {
      title: "Tìm kiếm",
      description: "Tìm bài hát, nghệ sĩ, album và playlist trên Melodix.",
    };
  }

  return {
    title: `Tìm kiếm: ${query}`,
    description: `Kết quả tìm kiếm cho ${query} trên ${SITE_CONFIG.name}.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  if (!query) {
    const [artistsResult, albumsResult, playlistsResult] = await Promise.allSettled([
      homeApi.getArtists({ limit: 8 }),
      homeApi.getAlbums({ limit: 8 }),
      serverSearchApi.getBrowsePlaylists(6),
    ]);

    return (
      <SearchPageContainer
        key="browse-search"
        query=""
        songs={[]}
        artists={
          artistsResult.status === "fulfilled" ? artistsResult.value.data || [] : []
        }
        albums={
          albumsResult.status === "fulfilled" ? albumsResult.value.data || [] : []
        }
        playlists={[]}
        browseArtists={
          artistsResult.status === "fulfilled" ? artistsResult.value.data || [] : []
        }
        browseAlbums={
          albumsResult.status === "fulfilled" ? albumsResult.value.data || [] : []
        }
        browsePlaylists={
          playlistsResult.status === "fulfilled"
            ? playlistsResult.value || []
            : []
        }
      />
    );
  }

  const results = await serverSearchApi.searchAll(query, {
    songs: 12,
    artists: 8,
    albums: 8,
    playlists: 8,
  });

  return (
    <SearchPageContainer
      key={query}
      query={query}
      songs={results.songs}
      artists={results.artists}
      albums={results.albums}
      playlists={results.playlists}
    />
  );
}

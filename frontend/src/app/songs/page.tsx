import type { Metadata } from "next";
import { serverSongsApi } from "@/api/server-songs";
import { SITE_CONFIG } from "@/common/seo";
import { SongsPageContainer } from "@/features/main/containers/Songs";

type SongsPageProps = {
  searchParams?: Promise<{
    q?: string;
    artistId?: string;
    genreId?: string;
    page?: string;
  }>;
};

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Bài hát",
  description:
    "Duyệt danh sách bài hát công khai trên Melodix, lọc theo nghệ sĩ và thể loại, rồi phát trực tiếp ngay từ danh sách.",
  alternates: {
    canonical: "/songs",
  },
  openGraph: {
    title: `${SITE_CONFIG.name} | Bài hát`,
    description:
      "Duyệt danh sách bài hát công khai trên Melodix, lọc theo nghệ sĩ và thể loại, rồi phát trực tiếp ngay từ danh sách.",
    url: `${SITE_CONFIG.url}/songs`,
  },
};

export default async function SongsPage({ searchParams }: SongsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = resolvedSearchParams.q?.trim() ?? "";
  const artistId = resolvedSearchParams.artistId
    ? Number(resolvedSearchParams.artistId)
    : undefined;
  const genreId = resolvedSearchParams.genreId
    ? Number(resolvedSearchParams.genreId)
    : undefined;
  const page = resolvedSearchParams.page ? Math.max(Number(resolvedSearchParams.page), 1) : 1;

  const [songsResult, artistsResult, genresResult] = await Promise.allSettled([
    serverSongsApi.getSongs({
      page,
      limit: 20,
      search: q || undefined,
      artistId,
      genreId,
    }),
    serverSongsApi.getArtists(50),
    serverSongsApi.getGenres(50),
  ]);

  const songsResponse =
    songsResult.status === "fulfilled"
      ? songsResult.value
      : {
          data: [],
          metadata: {
            total: 0,
            page,
            limit: 20,
            totalPages: 0,
            hasNext: false,
            hasPrevious: page > 1,
          },
        };
  const artists = artistsResult.status === "fulfilled" ? artistsResult.value.data || [] : [];
  const genres = genresResult.status === "fulfilled" ? genresResult.value.data || [] : [];

  return (
    <SongsPageContainer
      songsResponse={songsResponse}
      artists={artists}
      genres={genres}
      filters={{
        q,
        artistId,
        genreId,
        page,
        limit: 20,
      }}
    />
  );
}

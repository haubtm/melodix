import type { Metadata } from "next";
import { serverSongsApi } from "@/api/server-songs";
import { SITE_CONFIG } from "@/common/seo";
import { SongsPageContainer } from "@/features/main/containers/Songs";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    artistId?: string;
    genreId?: string;
    page?: string;
  }>;
};

export const revalidate = 120;

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = (await searchParams) ?? {};
  const q = params.q?.trim();

  return {
    title: q ? `Tìm kiếm: ${q}` : "Tìm kiếm",
    description: q
      ? `Kết quả tìm kiếm bài hát cho "${q}" trên ${SITE_CONFIG.name}.`
      : `Tìm kiếm bài hát, nghệ sĩ và thể loại trên ${SITE_CONFIG.name}.`,
    alternates: {
      canonical: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
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

  const title = q ? `Kết quả cho "${q}"` : "Tìm kiếm bài hát";
  const description = q
    ? `Lọc sâu hơn theo nghệ sĩ hoặc thể loại để thu hẹp kết quả cho "${q}".`
    : "Nhập từ khóa ở thanh trên cùng hoặc dùng bộ lọc bên dưới để tìm bài hát phù hợp.";

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
      copy={{
        eyebrow: "Tìm kiếm",
        title,
        description,
        contentTitle: q ? "Kết quả phù hợp" : "Tất cả bài hát",
      }}
    />
  );
}


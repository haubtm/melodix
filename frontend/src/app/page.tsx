import type { Metadata } from "next";
import { homeApi } from "@/api/server-home";
import { SITE_CONFIG } from "@/common/seo";
import { HomeContainer } from "@/features/main/containers/Home";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Trang chủ",
  description:
    "Khám phá bài hát phổ biến, album nổi bật và nghệ sĩ đang được yêu thích trên Melodix.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_CONFIG.name} | Trang chủ`,
    description:
      "Khám phá bài hát phổ biến, album nổi bật và nghệ sĩ đang được yêu thích trên Melodix.",
    url: SITE_CONFIG.url,
  },
};

export default async function HomePage() {
  const [songsResult, albumsResult, artistsResult] = await Promise.allSettled([
    homeApi.getSongs({ limit: 10 }),
    homeApi.getAlbums({ limit: 6 }),
    homeApi.getArtists({ limit: 6 }),
  ]);

  const songsData =
    songsResult.status === "fulfilled" ? songsResult.value : { data: [] };
  const albumsData =
    albumsResult.status === "fulfilled" ? albumsResult.value : { data: [] };
  const artistsData =
    artistsResult.status === "fulfilled" ? artistsResult.value : { data: [] };

  return (
    <HomeContainer
      songs={songsData.data || []}
      albums={albumsData.data || []}
      artists={artistsData.data || []}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverSongsApi } from "@/api/server-songs";
import { serverGet } from "@/api/server";
import { Album, Artist, IPaginatedResponse } from "@/dtos";
import { SITE_CONFIG } from "@/common/seo";
import { ArtistDetailContainer } from "@/features/main/containers/ArtistDetail";

interface ArtistPageProps {
  params: Promise<{ id: string }>;
}

function unwrapEntity<T extends object>(payload: T | { data: T }): T {
  return "data" in payload ? payload.data : payload;
}

function unwrapPaginated<T>(
  payload: IPaginatedResponse<T> | { data: IPaginatedResponse<T> },
): IPaginatedResponse<T> {
  return ("data" in payload && !Array.isArray(payload.data) ? payload.data : payload) as IPaginatedResponse<T>;
}

async function loadArtist(id: number): Promise<Artist> {
  const response = await serverGet<Artist | { data: Artist }>(`/artists/${id}`, {
    next: { revalidate: 120 },
  });

  return unwrapEntity(response);
}

export async function generateMetadata({
  params,
}: ArtistPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const artist = await loadArtist(Number(id));
    const description =
      artist.bio ||
      `Nghe các bài hát và album của ${artist.name} trên ${SITE_CONFIG.name}.`;

    return {
      title: `${artist.name}`,
      description,
      openGraph: {
        title: `${artist.name} | ${SITE_CONFIG.name}`,
        description,
        images: artist.avatarUrl ? [{ url: artist.avatarUrl, width: 300, height: 300 }] : [],
      },
    };
  } catch {
    return {
      title: "Nghệ sĩ không tồn tại",
    };
  }
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { id } = await params;
  const artistId = Number(id);

  const artist = await loadArtist(artistId).catch(() => null);
  if (!artist) {
    notFound();
  }

  const [songsResult, albumsResult] = await Promise.all([
    serverSongsApi.getSongs({ artistId, limit: 20 }).catch(() => ({
      data: [],
      metadata: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    })),
    serverGet<IPaginatedResponse<Album> | { data: IPaginatedResponse<Album> }>(
      `/albums?artistId=${artistId}&limit=12`,
      {
        next: { revalidate: 120 },
      },
    ).catch(() => ({
      data: {
        data: [],
        metadata: {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
        },
      },
    })),
  ]);

  const albumsResponse = unwrapPaginated(albumsResult);
  const albums = albumsResponse.data || [];

  return (
    <ArtistDetailContainer
      artist={artist}
      songs={songsResult.data || []}
      albums={albums}
    />
  );
}

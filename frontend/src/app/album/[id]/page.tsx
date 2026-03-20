import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverSongsApi } from "@/api/server-songs";
import { serverGet } from "@/api/server";
import { Album, IPaginatedResponse } from "@/dtos";
import { SITE_CONFIG } from "@/common/seo";
import { AlbumDetailContainer } from "@/features/main/containers/AlbumDetail";

interface AlbumPageProps {
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

async function loadAlbum(id: number): Promise<Album> {
  const response = await serverGet<Album | { data: Album }>(`/albums/${id}`, {
    next: { revalidate: 120 },
  });

  return unwrapEntity(response);
}

export async function generateMetadata({
  params,
}: AlbumPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const album = await loadAlbum(Number(id));
    const description =
      album.description ||
      `Nghe album ${album.title} trên ${SITE_CONFIG.name}.`;

    return {
      title: `${album.title}`,
      description,
      openGraph: {
        title: `${album.title} | ${SITE_CONFIG.name}`,
        description,
        images: album.coverUrl ? [{ url: album.coverUrl, width: 300, height: 300 }] : [],
      },
    };
  } catch {
    return {
      title: "Album không tồn tại",
    };
  }
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { id } = await params;
  const albumId = Number(id);

  const album = await loadAlbum(albumId).catch(() => null);
  if (!album) {
    notFound();
  }

  const [songsResult, moreAlbumsResponse] = await Promise.all([
    serverSongsApi.getSongs({ albumId, limit: 30 }).catch(() => ({
      data: [],
      metadata: {
        total: 0,
        page: 1,
        limit: 30,
        totalPages: 0,
      },
    })),
    serverGet<IPaginatedResponse<Album> | { data: IPaginatedResponse<Album> }>(
      `/albums?artistId=${album.artistId}&limit=8`,
      {
        next: { revalidate: 120 },
      },
    ).catch(() => ({
      data: {
        data: [],
        metadata: {
          total: 0,
          page: 1,
          limit: 8,
          totalPages: 0,
        },
      },
    })),
  ]);

  const moreAlbumsResult = unwrapPaginated(moreAlbumsResponse);
  const moreAlbums = (moreAlbumsResult.data || []).filter((item) => item.id !== album.id);

  return (
    <AlbumDetailContainer
      album={album}
      songs={songsResult.data || []}
      moreAlbums={moreAlbums}
    />
  );
}

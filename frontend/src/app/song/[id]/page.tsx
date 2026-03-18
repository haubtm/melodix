import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Song } from "@/dtos";
import { homeApi } from "@/api/server-home";
import { SITE_CONFIG } from "@/common/seo";
import { SongDetailContainer } from "@/features/main/containers/SongDetail";

interface SongPageProps {
  params: Promise<{ id: string }>;
}

async function loadSong(id: number): Promise<Song> {
  return homeApi.getSongById(id);
}

export async function generateMetadata({
  params,
}: SongPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const song = await loadSong(Number(id));
    const artistName = song.primaryArtist?.name || song.artist?.name || "Unknown Artist";
    const description = `Nghe "${song.title}" của ${artistName} trên ${SITE_CONFIG.name}. Phát nhạc trực tuyến miễn phí.`;

    return {
      title: `${song.title} - ${artistName}`,
      description,
      openGraph: {
        title: `${song.title} - ${artistName} | ${SITE_CONFIG.name}`,
        description,
        images: song.coverUrl
          ? [{ url: song.coverUrl, width: 300, height: 300 }]
          : [],
      },
    };
  } catch {
    return {
      title: "Bài hát không tìm thấy",
    };
  }
}

export default async function SongPage({ params }: SongPageProps) {
  const { id } = await params;

  try {
    const song = await loadSong(Number(id));

    if (!song?.id) {
      notFound();
    }

    return <SongDetailContainer song={song} />;
  } catch {
    notFound();
  }
}

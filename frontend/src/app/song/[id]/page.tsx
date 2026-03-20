import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Song } from "@/dtos";
import { homeApi } from "@/api/server-home";
import { serverSongsApi } from "@/api/server-songs";
import { SITE_CONFIG } from "@/common/seo";
import { SongDetailContainer } from "@/features/main/containers/SongDetail";

interface SongPageProps {
  params: Promise<{ id: string }>;
}

type SongResponse = Song | { data: Song };

async function loadSong(id: number): Promise<Song> {
  const response = (await homeApi.getSongById(id)) as SongResponse;
  return "data" in response ? response.data : response;
}

async function loadLyricsText(url?: string): Promise<string | undefined> {
  if (!url) {
    return undefined;
  }

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return undefined;
    }

    const text = (await response.text()).trim();
    return text || undefined;
  } catch {
    return undefined;
  }
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

    const artistId = song.primaryArtist?.id || song.artistId;
    const [lyricsText, albumSongsResult, artistSongsResult] = await Promise.all([
      loadLyricsText(song.lyricsUrl),
      song.albumId
        ? serverSongsApi.getSongs({
            albumId: song.albumId,
            limit: 20,
          })
        : Promise.resolve(null),
      artistId
        ? serverSongsApi.getSongs({
            artistId,
            limit: 12,
          })
        : Promise.resolve(null),
    ]);

    return (
      <SongDetailContainer
        song={{
          ...song,
          lyrics: lyricsText || song.lyrics,
        }}
        albumSongs={albumSongsResult?.data || []}
        artistSongs={(artistSongsResult?.data || []).filter(
          (artistSong) => artistSong.id !== song.id,
        )}
      />
    );
  } catch {
    notFound();
  }
}

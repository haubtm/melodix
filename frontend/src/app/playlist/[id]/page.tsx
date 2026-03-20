import type { Metadata } from "next";
import { PlaylistDetailContainer } from "@/features/main/containers/PlaylistDetail";

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Playlist",
  description: "Nghe playlist và quản lý danh sách bài hát của bạn trên Melodix.",
};

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;

  return <PlaylistDetailContainer playlistId={Number(id)} />;
}


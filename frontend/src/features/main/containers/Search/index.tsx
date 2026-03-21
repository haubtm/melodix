"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PauseCircleFilled, PlayCircleFilled } from "@ant-design/icons";
import MainLayout from "@/components/layout/MainLayout";
import FallbackImage from "@/components/common/FallbackImage";
import { AlbumCard, ArtistCard, PlaylistCard, SongCard } from "@/components/music";
import { Album, Artist, Playlist, Song } from "@/dtos";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playSong, togglePlay } from "@/store/slices/playerSlice";
import styles from "./SearchPage.module.css";

type SearchTab = "all" | "songs" | "albums" | "artists" | "playlists";

interface SearchPageContainerProps {
  query: string;
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  browseAlbums?: Album[];
  browseArtists?: Artist[];
  browsePlaylists?: Playlist[];
}

const TABS: Array<{ key: SearchTab; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "songs", label: "Bài hát" },
  { key: "albums", label: "Album" },
  { key: "artists", label: "Nghệ sĩ" },
  { key: "playlists", label: "Playlist" },
];

function getArtistName(song: Song) {
  return song.artist?.name || song.primaryArtist?.name || "Unknown Artist";
}

function getTopResult(
  query: string,
  songs: Song[],
  artists: Artist[],
  albums: Album[],
  playlists: Playlist[],
): { type: SearchTab; item: Song | Artist | Album | Playlist } | null {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return null;
  }

  const songMatch = songs.find((song) =>
    song.title.toLowerCase().includes(normalizedQuery),
  );
  if (songMatch) {
    return { type: "songs", item: songMatch };
  }

  const artistMatch = artists.find((artist) =>
    artist.name.toLowerCase().includes(normalizedQuery),
  );
  if (artistMatch) {
    return { type: "artists", item: artistMatch };
  }

  const albumMatch = albums.find((album) =>
    album.title.toLowerCase().includes(normalizedQuery),
  );
  if (albumMatch) {
    return { type: "albums", item: albumMatch };
  }

  const playlistMatch = playlists.find((playlist) =>
    playlist.name.toLowerCase().includes(normalizedQuery),
  );
  if (playlistMatch) {
    return { type: "playlists", item: playlistMatch };
  }

  return null;
}

export function SearchPageContainer({
  query,
  songs,
  albums,
  artists,
  playlists,
  browseAlbums = [],
  browseArtists = [],
  browsePlaylists = [],
}: SearchPageContainerProps) {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying } = useAppSelector((state) => state.player);
  const [activeTab, setActiveTab] = useState<SearchTab>("all");

  const topResult = getTopResult(query, songs, artists, albums, playlists);

  const handlePlayTopSong = (song: Song) => {
    if (currentSong?.id === song.id) {
      dispatch(togglePlay());
      return;
    }

    dispatch(playSong({ song, playlist: songs }));
  };

  const renderTopResult = () => {
    if (!topResult) {
      return (
        <div className={styles.empty}>
          Không có kết quả đủ phù hợp để hiển thị ở mục hàng đầu.
        </div>
      );
    }

    if (topResult.type === "songs") {
      const song = topResult.item as Song;
      const artistName = getArtistName(song);
      const isCurrent = currentSong?.id === song.id;
      const href = `/song/${song.id}`;

      return (
        <Link href={href} className={styles.topResultCard}>
          <FallbackImage
            src={song.coverUrl || song.album?.coverUrl}
            fallbackSrc="/images/default-cover.svg"
            alt={song.title}
            width={112}
            height={112}
            className={styles.topResultImage}
          />
          <h2 className={styles.topResultTitle}>{song.title}</h2>
          <p className={styles.topResultMeta}>Bài hát • {artistName}</p>
          <button
            type="button"
            className={styles.topResultPlay}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handlePlayTopSong(song);
            }}
          >
            {isCurrent && isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
          </button>
        </Link>
      );
    }

    if (topResult.type === "artists") {
      const artist = topResult.item as Artist;

      return (
        <Link href={`/artist/${artist.id}`} className={styles.topResultCard}>
          <FallbackImage
            src={artist.avatarUrl}
            fallbackSrc="/images/default-artist.svg"
            alt={artist.name}
            width={112}
            height={112}
            className={`${styles.topResultImage} ${styles.topResultArtist}`}
          />
          <h2 className={styles.topResultTitle}>{artist.name}</h2>
          <p className={styles.topResultMeta}>Nghệ sĩ</p>
        </Link>
      );
    }

    if (topResult.type === "albums") {
      const album = topResult.item as Album;

      return (
        <Link href={`/album/${album.id}`} className={styles.topResultCard}>
          <FallbackImage
            src={album.coverUrl}
            fallbackSrc="/images/default-cover.svg"
            alt={album.title}
            width={112}
            height={112}
            className={styles.topResultImage}
          />
          <h2 className={styles.topResultTitle}>{album.title}</h2>
          <p className={styles.topResultMeta}>
            Album • {album.artist?.name || "Melodix"}
          </p>
        </Link>
      );
    }

    const playlist = topResult.item as Playlist;
    const ownerName =
      playlist.owner?.displayName || playlist.owner?.username || "Melodix";

    return (
      <Link href={`/playlist/${playlist.id}`} className={styles.topResultCard}>
        <FallbackImage
          src={playlist.coverUrl || playlist.imageUrl}
          fallbackSrc="/images/default-cover.svg"
          alt={playlist.name}
          width={112}
          height={112}
          className={styles.topResultImage}
        />
        <h2 className={styles.topResultTitle}>{playlist.name}</h2>
        <p className={styles.topResultMeta}>Playlist • {ownerName}</p>
      </Link>
    );
  };

  const renderSongsSection = (title = "Bài hát", limit?: number) => {
    const visibleSongs = limit ? songs.slice(0, limit) : songs;

    if (!visibleSongs.length) {
      return null;
    }

    return (
      <section className={styles.songsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
        <div className={styles.songsList}>
          {visibleSongs.map((song, index) => (
            <SongCard
              key={song.id}
              song={song}
              playlist={songs}
              index={index}
              showAlbum
            />
          ))}
        </div>
      </section>
    );
  };

  const renderGridSection = <T,>({
    title,
    items,
    renderItem,
  }: {
    title: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
  }) => {
    if (!items.length) {
      return null;
    }

    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
        <div className={styles.grid}>{items.map(renderItem)}</div>
      </section>
    );
  };

  const renderBrowseSection = () => (
    <>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Tìm kiếm</p>
        <h1 className={styles.title}>Khám phá theo kiểu Spotify</h1>
        <p className={styles.subtitle}>
          Gõ tên bài hát, nghệ sĩ, album hoặc playlist ở thanh tìm kiếm phía trên.
          Melodix sẽ gợi ý nhanh và mở trang kết quả theo từng nhóm.
        </p>
      </section>

      {renderGridSection({
        title: "Nghệ sĩ nổi bật",
        items: browseArtists,
        renderItem: (artist) => <ArtistCard key={artist.id} artist={artist} />,
      })}

      {renderGridSection({
        title: "Album đáng chú ý",
        items: browseAlbums,
        renderItem: (album) => <AlbumCard key={album.id} album={album} />,
      })}

      {browsePlaylists.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Playlist gợi ý</h2>
          </div>
          <div className={styles.browseGrid}>
            {browsePlaylists.map((playlist) => (
                <Link
                  key={playlist.id}
                  href={`/playlist/${playlist.id}`}
                  className={styles.browseCard}
                >
                  <FallbackImage
                    src={playlist.coverUrl || playlist.imageUrl}
                    fallbackSrc="/images/default-cover.svg"
                  alt={playlist.name}
                  width={72}
                  height={72}
                  className={styles.browseImage}
                />
                  <div className={styles.browseText}>
                    <h3 className={styles.browseTitle}>{playlist.name}</h3>
                  <p className={styles.browseMeta}>
                    Playlist •{" "}
                    {playlist.owner?.displayName ||
                      playlist.owner?.username ||
                      "Melodix"}
                  </p>
                </div>
                </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );

  const renderQueryResults = () => {
    if (!songs.length && !artists.length && !albums.length && !playlists.length) {
      return (
        <div className={styles.empty}>
          Không tìm thấy kết quả nào cho “{query}”.
        </div>
      );
    }

    if (activeTab === "songs") {
      return renderSongsSection("Bài hát");
    }

    if (activeTab === "artists") {
      return renderGridSection({
        title: "Nghệ sĩ",
        items: artists,
        renderItem: (artist) => <ArtistCard key={artist.id} artist={artist} />,
      });
    }

    if (activeTab === "albums") {
      return renderGridSection({
        title: "Album",
        items: albums,
        renderItem: (album) => <AlbumCard key={album.id} album={album} />,
      });
    }

    if (activeTab === "playlists") {
      return renderGridSection({
        title: "Playlist",
        items: playlists,
        renderItem: (playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ),
      });
    }

    return (
      <>
        <div className={styles.resultsHero}>
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Kết quả hàng đầu</h2>
            </div>
            {renderTopResult()}
          </section>

          {renderSongsSection("Bài hát", 5)}
        </div>

        {renderGridSection({
          title: "Nghệ sĩ",
          items: artists.slice(0, 6),
          renderItem: (artist) => <ArtistCard key={artist.id} artist={artist} />,
        })}

        {renderGridSection({
          title: "Album",
          items: albums.slice(0, 6),
          renderItem: (album) => <AlbumCard key={album.id} album={album} />,
        })}

        {renderGridSection({
          title: "Playlist",
          items: playlists.slice(0, 6),
          renderItem: (playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ),
        })}
      </>
    );
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        {query ? (
          <>
            <section className={styles.hero}>
              <p className={styles.eyebrow}>Kết quả tìm kiếm</p>
              <h1 className={styles.title}>“{query}”</h1>
              <p className={styles.subtitle}>
                Kết quả được gom theo bài hát, nghệ sĩ, album và playlist, giống
                flow tìm kiếm kiểu Spotify.
              </p>
            </section>

            <div className={styles.chips}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`${styles.chip} ${
                    activeTab === tab.key ? styles.chipActive : ""
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {renderQueryResults()}
          </>
        ) : (
          renderBrowseSection()
        )}
      </div>
    </MainLayout>
  );
}

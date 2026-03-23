import { ArtistResponseDto } from '../../artists/dto/artist-response.dto';
import { SongArtistReferenceDto, SongResponseDto } from './song-response.dto';
import { buildMediaUrl } from '../../../common/utils/media-url.util';

type SongWithRelations = {
  audioUrl?: string | null;
  coverUrl?: string | null;
  lyricsUrl?: string | null;
  primaryArtist?: {
    id: number;
    name: string;
  } | null;
  primaryArtistId?: number | null;
  artistId?: number | null;
};

export function toSongResponseDto<T extends SongWithRelations>(
  song: T,
): T & Pick<SongResponseDto, 'artist' | 'artistId' | 'primaryArtist'> {
  const artistId = song.primaryArtist?.id ?? song.primaryArtistId ?? song.artistId ?? undefined;

  return {
    ...song,
    audioUrl: song.audioUrl ? (buildMediaUrl(song.audioUrl) ?? song.audioUrl) : song.audioUrl,
    coverUrl: song.coverUrl ? (buildMediaUrl(song.coverUrl) ?? song.coverUrl) : song.coverUrl,
    lyricsUrl: song.lyricsUrl ? (buildMediaUrl(song.lyricsUrl) ?? song.lyricsUrl) : song.lyricsUrl,
    artistId,
    primaryArtist: song.primaryArtist
      ? new ArtistResponseDto(
          song.primaryArtist as ConstructorParameters<typeof ArtistResponseDto>[0],
        )
      : undefined,
    artist: song.primaryArtist
      ? new SongArtistReferenceDto({
          id: song.primaryArtist.id,
          name: song.primaryArtist.name,
        })
      : undefined,
  };
}

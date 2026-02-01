import { ApiProperty } from '@nestjs/swagger';
import { PlaylistEntity } from '../entity/playlist.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PlaylistSongResponseDto } from './playlist-song-response.dto';
import { SongResponseDto } from '../../songs/dto/song-response.dto';
import { ArtistResponseDto } from '../../artists/dto/artist-response.dto';

export class PlaylistResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'My Favorite Songs' })
  name: string;

  @ApiProperty({ example: 'my-favorite-songs' })
  slug: string;

  @ApiProperty({ example: 'Những bài hát hay nhất', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'https://example.com/cover.jpg', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: false })
  isPublic: boolean;

  @ApiProperty({ example: 10 })
  totalTracks: number;

  @ApiProperty({ example: 3600000 })
  durationMs: number;

  @ApiProperty({ type: () => UserResponseDto, nullable: true })
  owner?: UserResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => [PlaylistSongResponseDto], nullable: true })
  songs?: PlaylistSongResponseDto[];

  constructor(entity: PlaylistEntity & { songs?: any[] }) {
    this.id = entity.id;
    this.name = entity.name;
    this.slug = entity.slug;
    this.description = entity.description;
    this.imageUrl = entity.imageUrl;
    this.isPublic = entity.isPublic;
    this.totalTracks = entity.totalTracks;
    this.durationMs = entity.durationMs;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;

    if (entity.user) {
      this.owner = new UserResponseDto(entity.user);
    }

    if (entity.songs && entity.songs.length > 0) {
      this.songs = (entity.songs as any[])
        .map((item) => {
          // Handle both raw relation or already mapped song
          if (!item.song) return null;

          const songData = new SongResponseDto({
            id: item.song.id,
            title: item.song.title,
            slug: item.song.slug,
            durationMs: item.song.durationMs,
            audioUrl: item.song.audioUrl,
            coverUrl: item.song.coverUrl,
            playCount: Number(item.song.playCount ?? 0),
            createdAt: item.song.createdAt,
            primaryArtist: item.song.primaryArtist
              ? new ArtistResponseDto(item.song.primaryArtist)
              : undefined,
          });

          return new PlaylistSongResponseDto({
            id: item.id,
            position: item.position,
            addedAt: item.addedAt,
            addedBy: item.addedBy,
            song: songData,
          });
        })
        .filter((item): item is PlaylistSongResponseDto => item !== null);
    }
  }
}

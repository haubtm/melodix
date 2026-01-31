import { ApiProperty } from '@nestjs/swagger';
import { AlbumType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { ArtistResponseDto } from '../../artists/dto/artist-response.dto';
import { SongResponseDto } from '../../songs/dto/song-response.dto';

@Exclude()
export class AlbumResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  slug: string;

  @ApiProperty({ required: false })
  @Expose()
  description: string | null;

  @ApiProperty({ required: false })
  @Expose()
  coverUrl: string | null;

  @ApiProperty({ required: false })
  @Expose()
  releaseDate: Date | null;

  @ApiProperty({ enum: AlbumType })
  @Expose()
  albumType: AlbumType;

  @ApiProperty()
  @Expose()
  totalTracks: number;

  @ApiProperty()
  @Expose()
  durationMs: number;

  @ApiProperty()
  @Expose()
  isPublished: boolean;

  @ApiProperty()
  @Expose()
  artistId: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  // Relations
  @ApiProperty({ type: () => ArtistResponseDto, required: false })
  @Expose()
  @Type(() => ArtistResponseDto)
  artist?: ArtistResponseDto;

  @ApiProperty({ type: () => [SongResponseDto], required: false })
  @Expose()
  @Type(() => SongResponseDto)
  songs?: SongResponseDto[];

  constructor(partial: Partial<AlbumResponseDto>) {
    Object.assign(this, partial);
  }
}

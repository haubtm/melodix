import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArtistResponseDto } from '../../artists/dto/artist-response.dto';

export class SongResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  durationMs: number;

  @ApiProperty()
  audioUrl: string;

  @ApiPropertyOptional()
  coverUrl?: string;

  @ApiPropertyOptional()
  lyricsUrl?: string;

  @ApiProperty()
  playCount: number; // Changed from BigInt to number for JSON response

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ type: () => ArtistResponseDto })
  @Type(() => ArtistResponseDto)
  primaryArtist?: ArtistResponseDto;

  // We can expand this to include Album and Genres as needed
  @ApiPropertyOptional()
  albumId?: number;

  constructor(partial: Partial<SongResponseDto>) {
    Object.assign(this, partial);
  }
}

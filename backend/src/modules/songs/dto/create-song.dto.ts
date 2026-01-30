import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateSongDto {
  @ApiProperty({ example: 'Shape of You' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  artistId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @IsInt()
  albumId?: number;

  @ApiProperty({ example: 233000, description: 'Duration in milliseconds' })
  @IsNumber()
  @IsInt()
  @Min(0)
  durationMs: number;

  @ApiProperty({ example: 'https://s3.aws.com/melodix/audio/song.mp3' })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  audioUrl: string;

  @ApiPropertyOptional({ example: 'https://s3.aws.com/melodix/covers/song.jpg' })
  @IsOptional()
  @IsString()
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({ example: 'https://s3.aws.com/melodix/lyrics/song.lrc' })
  @IsOptional()
  @IsString()
  @IsUrl()
  lyricsUrl?: string;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  genreIds?: number[];

  @ApiPropertyOptional({ example: [2, 3], type: [Number], description: 'IDs of featured artists' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  featuredArtistIds?: number[];
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { AlbumType } from '@prisma/client';

export class CreateAlbumDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  artistId: number;

  @ApiProperty({ example: 'Future Nostalgia' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'future-nostalgia', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Second studio album by Dua Lipa', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/cover.jpg', required: false })
  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @ApiProperty({ example: '2020-03-27', required: false })
  @IsDateString()
  @IsOptional()
  releaseDate?: string;

  @ApiProperty({ enum: AlbumType, example: AlbumType.album, required: false })
  @IsEnum(AlbumType)
  @IsOptional()
  albumType?: AlbumType;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

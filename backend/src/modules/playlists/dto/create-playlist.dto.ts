import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({ example: 'My Favorite Songs', description: 'Tên playlist' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Những bài hát hay nhất', description: 'Mô tả', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Công khai hay không',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({
    example: 'https://example.com/playlist-cover.jpg',
    description: 'URL ảnh bìa',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

import { IsString, IsOptional, IsNotEmpty, Matches, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty({ example: 1, description: 'User ID liên kết' })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Son Tung M-TP', description: 'Tên nghệ sĩ' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'son-tung-m-tp',
    description: 'Slug (URL friendly version of name)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be kebab-case',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Bio của nghệ sĩ...', description: 'Tiểu sử' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/cover.jpg',
    description: 'Cover image URL',
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;
}

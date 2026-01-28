import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ArtistResponseDto {
  @Expose()
  @ApiProperty({ example: 1, description: 'Artist ID' })
  id: number;

  @Expose()
  @ApiPropertyOptional({ example: 1, description: 'Linked User ID' })
  userId: number | null;

  @Expose()
  @ApiProperty({ example: 'Son Tung M-TP', description: 'Tên nghệ sĩ' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'son-tung-m-tp', description: 'Slug' })
  slug: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Bio description', description: 'Tiểu sử' })
  bio: string | null;

  @Expose()
  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  avatarUrl: string | null;

  @Expose()
  @ApiPropertyOptional({
    example: 'https://example.com/cover.jpg',
    description: 'Cover URL',
  })
  coverUrl: string | null;

  @Expose()
  @ApiProperty({ example: true, description: 'Đã xác minh' })
  verified: boolean;

  @Expose()
  @ApiProperty({ example: 1000000, description: 'Số người nghe hàng tháng' })
  monthlyListeners: number;

  @Expose()
  @ApiProperty({ example: '2026-01-01T00:00:00Z', description: 'Ngày tạo' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2026-01-01T00:00:00Z', description: 'Ngày cập nhật' })
  updatedAt: Date;

  constructor(partial: Partial<ArtistResponseDto>) {
    Object.assign(this, partial);
  }
}

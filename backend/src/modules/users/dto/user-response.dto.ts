import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @Expose()
  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  email: string;

  @Expose()
  @ApiProperty({ example: 'johndoe', description: 'Username' })
  username: string;

  @Expose()
  @ApiPropertyOptional({ example: 'John Doe', description: 'Tên hiển thị' })
  displayName: string | null;

  @Expose()
  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL ảnh đại diện',
  })
  avatarUrl: string | null;

  @Expose()
  @ApiPropertyOptional({ example: '1990-01-15', description: 'Ngày sinh' })
  dateOfBirth: Date | null;

  @Expose()
  @ApiPropertyOptional({ example: 'VN', description: 'Mã quốc gia' })
  country: string | null;

  @Expose()
  @ApiProperty({
    example: 'free',
    enum: ['free', 'premium', 'family'],
    description: 'Loại subscription',
  })
  subscriptionType: string;

  @Expose()
  @ApiProperty({ example: false, description: 'User có phải artist không' })
  isArtist: boolean;

  @Expose()
  @ApiProperty({ example: true, description: 'Tài khoản đang hoạt động' })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: true, description: 'Email đã được xác thực' })
  emailVerified: boolean;

  @Expose()
  @ApiProperty({
    example: '2026-01-27T12:00:00.000Z',
    description: 'Ngày tạo tài khoản',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2026-01-27T12:00:00.000Z',
    description: 'Ngày cập nhật cuối',
  })
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

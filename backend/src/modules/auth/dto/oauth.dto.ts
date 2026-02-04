import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OAuthUserDto {
  @ApiProperty({ example: 'google', description: 'OAuth provider name' })
  provider: string;

  @ApiProperty({ example: '123456789', description: 'User ID from provider' })
  providerId: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email: string | null;

  @ApiPropertyOptional({ example: 'John Doe' })
  displayName: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl: string | null;

  @ApiPropertyOptional()
  accessToken?: string;

  @ApiPropertyOptional()
  refreshToken?: string;
}

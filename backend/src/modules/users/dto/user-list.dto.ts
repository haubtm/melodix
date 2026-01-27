import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BaseListDto } from '../../../common/dto';

export class UserListDto extends BaseListDto {
  @ApiPropertyOptional({
    example: 'user',
    description: 'Lọc theo role (user, artist, admin)',
  })
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    example: 'premium',
    description: 'Lọc theo subscription type',
  })
  @IsOptional()
  subscriptionType?: string;

  @ApiPropertyOptional({
    example: { fields: ['displayName', 'username'], data: 'john' },
    description: 'Tìm kiếm User (fields: displayName, username, email)',
  })
  @IsOptional()
  override search?: any = undefined;
}

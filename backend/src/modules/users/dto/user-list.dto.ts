import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseListDto } from '../../../common/dto';

export class UserListDto extends BaseListDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Lọc theo trạng thái artist',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isArtist?: boolean;

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

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BaseListDto } from '../../../common/dto';

export class ArtistListDto extends BaseListDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Lọc theo trạng thái đã xác minh',
  })
  @IsOptional()
  verified?: boolean;

  @ApiPropertyOptional({
    example: { fields: ['name', 'slug', 'bio'], data: 'son tung' },
    description: 'Tìm kiếm Artist (fields: name, slug, bio)',
  })
  @IsOptional()
  override search?: any = undefined;
}

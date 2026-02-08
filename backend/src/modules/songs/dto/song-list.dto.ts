import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { BaseListDto } from '../../../common/dto';
import { SongStatus } from '@prisma/client';

export class SongListDto extends BaseListDto {
  @ApiPropertyOptional({
    example: 'approved',
    enum: SongStatus,
    description: 'Lọc theo trạng thái (pending, approved, rejected)',
  })
  @IsOptional()
  @IsEnum(SongStatus)
  status?: SongStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo Artist ID',
  })
  @IsOptional()
  artistId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo Album ID',
  })
  @IsOptional()
  albumId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo Genre ID',
  })
  @IsOptional()
  genreId?: number;

  @ApiPropertyOptional({
    example: { fields: ['title'], data: 'Baby' },
    description: 'Tìm kiếm Song (fields: title)',
  })
  @IsOptional()
  override search?: any = undefined;
}

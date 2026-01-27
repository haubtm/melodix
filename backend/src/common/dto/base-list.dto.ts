import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFieldDto {
  @ApiPropertyOptional({
    example: ['name', 'email'],
    description: 'Các trường để tìm kiếm',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiPropertyOptional({ example: 'john', description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  data?: string;
}

export class SortFieldDto {
  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Trường để sắp xếp',
  })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    description: 'Thứ tự sắp xếp',
  })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';
}

export class BaseListDto {
  @ApiPropertyOptional({ example: 1, description: 'Số trang', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Số lượng mỗi trang',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ type: SearchFieldDto, description: 'Tìm kiếm' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchFieldDto)
  search?: SearchFieldDto;

  @ApiPropertyOptional({
    example: true,
    description: 'Lọc theo trạng thái active',
  })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ type: [SortFieldDto], description: 'Sắp xếp' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortFieldDto)
  sorts?: SortFieldDto[];
}

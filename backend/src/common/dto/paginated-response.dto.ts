import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  data: T[];

  @ApiProperty({ example: 100, description: 'Tổng số items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Trang hiện tại' })
  page: number;

  @ApiProperty({ example: 10, description: 'Số items mỗi trang' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Tổng số trang' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Có trang tiếp theo không' })
  hasNext: boolean;

  @ApiProperty({ example: false, description: 'Có trang trước không' })
  hasPrevious: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrevious = page > 1;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsInt } from 'class-validator';

export class DeleteManyDto {
  @ApiProperty({
    description: 'Danh sách user IDs cần xóa',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true, message: 'ID không hợp lệ (yêu cầu số nguyên)' })
  ids: number[];
}

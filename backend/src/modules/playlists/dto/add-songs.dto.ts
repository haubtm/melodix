import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class AddSongsDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Danh sách ID bài hát cần thêm' })
  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  songIds: number[];
}

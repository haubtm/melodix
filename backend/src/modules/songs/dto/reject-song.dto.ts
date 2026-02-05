import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RejectSongDto {
  @ApiPropertyOptional({
    description: 'Lý do từ chối bài hát',
    example: 'Nội dung vi phạm quy định cộng đồng',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}

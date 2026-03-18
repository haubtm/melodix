import { ApiProperty } from '@nestjs/swagger';
import { ContextType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class RecordPlayDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  songId: number;

  @ApiProperty({ example: 30000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMs?: number;

  @ApiProperty({ enum: ContextType, required: false })
  @IsOptional()
  @IsEnum(ContextType)
  contextType?: ContextType;

  @ApiProperty({ example: 12, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  contextId?: number;
}

import { PartialType } from '@nestjs/swagger';
import { CreateArtistDto } from './create-artist.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArtistDto extends PartialType(CreateArtistDto) {
  @ApiPropertyOptional({ description: 'Xác minh nghệ sĩ' })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

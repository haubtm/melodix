import { ApiProperty } from '@nestjs/swagger';
import { GenreEntity } from '../entity/genre.entity';

export class GenreResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Pop' })
  name: string;

  @ApiProperty({ example: 'pop' })
  slug: string;

  @ApiProperty({ example: 'Nhạc Pop phổ biến', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'https://example.com/pop.jpg', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: '#FF5733', nullable: true })
  color: string | null;

  @ApiProperty()
  createdAt: Date;

  constructor(entity: GenreEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.slug = entity.slug;
    this.description = entity.description;
    this.imageUrl = entity.imageUrl;
    this.color = entity.color;
    this.createdAt = entity.createdAt;
  }
}

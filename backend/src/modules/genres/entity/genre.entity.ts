import { Genre } from '@prisma/client';

export class GenreEntity implements Genre {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  color: string | null;
  createdAt: Date;

  constructor(partial: Partial<GenreEntity>) {
    Object.assign(this, partial);
  }
}

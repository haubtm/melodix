import { Album, AlbumType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class AlbumEntity implements Album {
  id: number;
  artistId: number;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;

  @Transform(({ value }) => value && new Date(value))
  releaseDate: Date | null;

  albumType: AlbumType;
  totalTracks: number;
  durationMs: number;
  isPublished: boolean;

  @Transform(({ value }) => new Date(value))
  createdAt: Date;

  @Transform(({ value }) => new Date(value))
  @Transform(({ value }) => new Date(value))
  updatedAt: Date;

  artist?: any;
  songs?: any[];

  constructor(partial: Partial<AlbumEntity>) {
    Object.assign(this, partial);
  }
}

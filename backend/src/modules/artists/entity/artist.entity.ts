import { Artist } from '@prisma/client';

export class ArtistEntity implements Artist {
  id: number;
  userId: number | null;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  monthlyListeners: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ArtistEntity>) {
    Object.assign(this, partial);
  }
}

import { Playlist, PlaylistSong } from '@prisma/client';
import { UserEntity } from '../../users/entity/user.entity';

export class PlaylistEntity implements Playlist {
  id: number;
  userId: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  isCollaborative: boolean;
  totalTracks: number;
  durationMs: number;
  createdAt: Date;
  updatedAt: Date;

  user?: UserEntity;
  songs?: PlaylistSong[];

  constructor(partial: Partial<PlaylistEntity>) {
    Object.assign(this, partial);
  }
}

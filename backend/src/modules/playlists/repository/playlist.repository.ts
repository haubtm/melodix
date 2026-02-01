import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlaylistEntity } from '../entity/playlist.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlaylistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PlaylistCreateInput): Promise<PlaylistEntity> {
    return this.prisma.playlist.create({
      data,
      include: {
        user: true,
        songs: {
          include: {
            song: {
              include: {
                primaryArtist: true,
                album: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PlaylistWhereInput;
    orderBy?: Prisma.PlaylistOrderByWithRelationInput;
  }): Promise<PlaylistEntity[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.playlist.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        user: true,
        songs: {
          include: {
            song: {
              include: {
                primaryArtist: true,
                album: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findById(id: number): Promise<PlaylistEntity | null> {
    return this.prisma.playlist.findUnique({
      where: { id },
      include: {
        user: true,
        songs: {
          include: {
            song: {
              include: {
                primaryArtist: true,
                album: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async update(id: number, data: Prisma.PlaylistUpdateInput): Promise<PlaylistEntity> {
    return this.prisma.playlist.update({
      where: { id },
      data,
      include: {
        user: true,
        songs: {
          include: {
            song: {
              include: {
                primaryArtist: true,
                album: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async delete(id: number): Promise<PlaylistEntity> {
    return this.prisma.playlist.delete({ where: { id } });
  }

  async addSong(data: Prisma.PlaylistSongCreateInput) {
    return this.prisma.playlistSong.create({ data });
  }

  async removeSong(playlistId: number, songId: number) {
    return this.prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });
  }

  async count(where?: Prisma.PlaylistWhereInput): Promise<number> {
    return this.prisma.playlist.count({ where });
  }

  async countSongs(playlistId: number): Promise<number> {
    return this.prisma.playlistSong.count({ where: { playlistId } });
  }
}

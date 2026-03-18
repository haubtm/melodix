import { Injectable } from '@nestjs/common';
import { ContextType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlaybackRepository {
  constructor(private readonly prisma: PrismaService) {}

  async incrementSongPlayCount(songId: number) {
    return this.prisma.song.update({
      where: { id: songId },
      data: {
        playCount: {
          increment: 1,
        },
      },
    });
  }

  async createListeningHistory(params: {
    userId: number;
    songId: number;
    durationMs?: number;
    contextType?: ContextType;
    contextId?: number;
  }) {
    return this.prisma.listeningHistory.create({
      data: {
        user: { connect: { id: params.userId } },
        song: { connect: { id: params.songId } },
        durationMs: params.durationMs ?? 0,
        contextType: params.contextType,
        contextId: params.contextId,
      },
    });
  }

  async upsertRecentlyPlayed(params: {
    userId: number;
    songId: number;
    contextType?: ContextType;
    contextId?: number;
  }) {
    return this.prisma.recentlyPlayed.upsert({
      where: {
        userId_songId: {
          userId: params.userId,
          songId: params.songId,
        },
      },
      create: {
        user: { connect: { id: params.userId } },
        song: { connect: { id: params.songId } },
        playedAt: new Date(),
        contextType: params.contextType,
        contextId: params.contextId,
      },
      update: {
        playedAt: new Date(),
        contextType: params.contextType,
        contextId: params.contextId,
      },
    });
  }

  async getRecentlyPlayed(userId: number, take: number) {
    return this.prisma.recentlyPlayed.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take,
      include: {
        song: {
          include: {
            album: true,
            primaryArtist: true,
            songArtists: {
              include: {
                artist: true,
              },
            },
            genres: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
    });
  }

  async runInTransaction<T>(operations: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction((tx) => operations(tx));
  }
}

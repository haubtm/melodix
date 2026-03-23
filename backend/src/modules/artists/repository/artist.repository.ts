import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ArtistEntity } from '../entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class ArtistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ArtistCreateInput): Promise<ArtistEntity> {
    return this.prisma.artist.create({
      data,
      include: {
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<ArtistEntity | null> {
    return this.prisma.artist.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<ArtistEntity | null> {
    return this.prisma.artist.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: number): Promise<ArtistEntity | null> {
    return this.prisma.artist.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ArtistWhereInput;
    orderBy?: Prisma.ArtistOrderByWithRelationInput | Prisma.ArtistOrderByWithRelationInput[];
  }): Promise<ArtistEntity[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.artist.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
    });
  }

  async getListUsingSelect(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ArtistWhereInput;
    orderBy?: Prisma.ArtistOrderByWithRelationInput | Prisma.ArtistOrderByWithRelationInput[];
  }): Promise<{ id: number; name: string }[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.artist.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getStats(
    id: number,
  ): Promise<{ songCount: number; albumCount: number; monthlyListeners: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [songCount, albumCount, distinctListeners] = await Promise.all([
      this.prisma.song.count({ where: { artistId: id } }),
      this.prisma.album.count({ where: { artistId: id } }),
      this.prisma.listeningHistory.findMany({
        where: {
          playedAt: { gte: thirtyDaysAgo },
          song: { artistId: id },
        },
        distinct: ['userId'],
        select: { userId: true },
      }),
    ]);

    return {
      songCount,
      albumCount,
      monthlyListeners: distinctListeners.length,
    };
  }

  async deleteMany(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.prisma.artist.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async count(where?: Prisma.ArtistWhereInput): Promise<number> {
    return this.prisma.artist.count({ where });
  }

  async update(id: number, data: Prisma.ArtistUpdateInput): Promise<ArtistEntity> {
    return this.prisma.artist.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<ArtistEntity> {
    return this.prisma.artist.delete({
      where: { id },
      include: {
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
    });
  }
}

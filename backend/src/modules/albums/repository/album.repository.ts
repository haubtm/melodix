import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlbumEntity } from '../entity/album.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class AlbumRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AlbumCreateInput): Promise<AlbumEntity> {
    return this.prisma.album.create({
      data,
      include: {
        songs: {
          orderBy: [{ trackNumber: 'asc' }, { createdAt: 'asc' }],
          include: { primaryArtist: true },
        },
      },
    });
  }

  async findById(id: number): Promise<AlbumEntity | null> {
    return this.prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        songs: {
          orderBy: [{ trackNumber: 'asc' }, { createdAt: 'asc' }],
          include: { primaryArtist: true },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<AlbumEntity | null> {
    return this.prisma.album.findUnique({
      where: { slug },
      include: {
        artist: true,
        songs: {
          orderBy: [{ trackNumber: 'asc' }, { createdAt: 'asc' }],
          include: { primaryArtist: true },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AlbumWhereInput;
    orderBy?: Prisma.AlbumOrderByWithRelationInput | Prisma.AlbumOrderByWithRelationInput[];
  }): Promise<AlbumEntity[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.album.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        artist: true,
        songs: {
          orderBy: [{ trackNumber: 'asc' }, { createdAt: 'asc' }],
          include: { primaryArtist: true },
        },
      },
    });
  }

  async count(where?: Prisma.AlbumWhereInput): Promise<number> {
    return this.prisma.album.count({ where });
  }

  async update(id: number, data: Prisma.AlbumUpdateInput): Promise<AlbumEntity> {
    return this.prisma.album.update({
      where: { id },
      data,
      include: {
        artist: true,
        songs: {
          orderBy: [{ trackNumber: 'asc' }, { createdAt: 'asc' }],
          include: { primaryArtist: true },
        },
      },
    });
  }

  async delete(id: number): Promise<AlbumEntity> {
    return this.prisma.album.delete({ where: { id } });
  }

  async getListUsingSelect(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AlbumWhereInput;
    orderBy?: Prisma.AlbumOrderByWithRelationInput | Prisma.AlbumOrderByWithRelationInput[];
  }): Promise<{ id: number; title: string }[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.album.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        title: true,
      },
    });
  }

  async deleteMany(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.prisma.album.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}

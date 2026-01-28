import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ArtistEntity } from '../entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class ArtistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ArtistCreateInput): Promise<ArtistEntity> {
    return this.prisma.artist.create({ data });
  }

  async findById(id: number): Promise<ArtistEntity | null> {
    return this.prisma.artist.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<ArtistEntity | null> {
    return this.prisma.artist.findUnique({ where: { slug } });
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
    });
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
    });
  }

  async delete(id: number): Promise<ArtistEntity> {
    return this.prisma.artist.delete({ where: { id } });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenreEntity } from '../entity/genre.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class GenreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.GenreCreateInput): Promise<GenreEntity> {
    return this.prisma.genre.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.GenreWhereInput;
    orderBy?: Prisma.GenreOrderByWithRelationInput;
  }): Promise<GenreEntity[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.genre.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async findById(id: number): Promise<GenreEntity | null> {
    return this.prisma.genre.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<GenreEntity | null> {
    return this.prisma.genre.findUnique({ where: { slug } });
  }

  async update(id: number, data: Prisma.GenreUpdateInput): Promise<GenreEntity> {
    return this.prisma.genre.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<GenreEntity> {
    return this.prisma.genre.delete({ where: { id } });
  }

  async deleteMany(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.prisma.genre.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async count(where?: Prisma.GenreWhereInput): Promise<number> {
    return this.prisma.genre.count({ where });
  }
}

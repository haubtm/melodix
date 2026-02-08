import { Injectable } from '@nestjs/common';
import { Prisma, SongStatus } from '@prisma/client';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SongRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SongCreateInput) {
    return this.prisma.song.create({
      data,
      include: {
        primaryArtist: true,
        album: true,
        songArtists: {
          include: {
            artist: true,
          },
        },
      },
    });
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    artistId?: number,
    albumId?: number,
    genreId?: number,
    status?: SongStatus,
  ): Promise<PaginatedResponseDto<any>> {
    const skip = (page - 1) * limit;
    const where: Prisma.SongWhereInput = {
      ...(search && {
        OR: [{ title: { contains: search } }],
      }),
      ...(artistId && { artistId }),
      ...(albumId && { albumId }),
      ...(genreId && { genres: { some: { genreId } } }),
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.song.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          primaryArtist: true,
          album: true,
          songArtists: {
            include: {
              artist: true,
            },
          },
        },
      }),
      this.prisma.song.count({ where }),
    ]);

    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findByArtistUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResponseDto<any>> {
    const skip = (page - 1) * limit;
    const where: Prisma.SongWhereInput = {
      primaryArtist: {
        userId: userId,
      },
    };

    const [items, total] = await Promise.all([
      this.prisma.song.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          primaryArtist: true,
          album: true,
          songArtists: {
            include: {
              artist: true,
            },
          },
        },
      }),
      this.prisma.song.count({ where }),
    ]);

    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findOne(id: number) {
    return this.prisma.song.findUnique({
      where: { id },
      include: {
        primaryArtist: true,
        album: true,
        genres: {
          include: {
            genre: true,
          },
        },
        songArtists: {
          include: {
            artist: true,
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.SongUpdateInput) {
    return this.prisma.song.update({
      where: { id },
      data,
      include: {
        primaryArtist: true,
        album: true,
        songArtists: {
          include: {
            artist: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.song.delete({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.song.findUnique({
      where: { slug },
    });
  }

  async getListUsingSelect(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SongWhereInput;
    orderBy?: Prisma.SongOrderByWithRelationInput;
  }): Promise<{ id: number; title: string }[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.song.findMany({
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

  async count(where?: Prisma.SongWhereInput): Promise<number> {
    return this.prisma.song.count({ where });
  }
}

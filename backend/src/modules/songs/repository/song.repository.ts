import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
  ): Promise<PaginatedResponseDto<any>> {
    const skip = (page - 1) * limit;
    const where: Prisma.SongWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search } }, // Case-insensitive handled by collation or specific logic if needed
        ],
      }),
      ...(artistId && { artistId }),
      ...(albumId && { albumId }),
      ...(genreId && { genres: { some: { genreId } } }),
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
}

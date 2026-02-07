import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GenreRepository } from '../repository/genre.repository';
import { CreateGenreDto, UpdateGenreDto, GenreResponseDto, GenreListDto } from '../dto';
import { DeleteManyDto } from '../../../common/dto/delete-many.dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GenreService {
  constructor(private readonly genreRepository: GenreRepository) {}

  async create(dto: CreateGenreDto): Promise<GenreResponseDto> {
    let slug = dto.slug;
    if (!slug) {
      slug = this.generateSlug(dto.name);
    }

    const existingSlug = await this.genreRepository.findBySlug(slug);
    if (existingSlug) {
      throw new BadRequestException('Slug already exists');
    }

    const genre = await this.genreRepository.create({
      ...dto,
      slug,
    });

    return new GenreResponseDto(genre);
  }

  async findAll(listDto: GenreListDto): Promise<PaginatedResponseDto<GenreResponseDto>> {
    const page = listDto.page || 1;
    const limit = Number(listDto.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.GenreWhereInput = {};
    if (listDto.search && listDto.search.data) {
      const keyword = listDto.search.data;
      where.OR = [{ name: { contains: keyword } }, { description: { contains: keyword } }];
    }

    const [genres, total] = await Promise.all([
      this.genreRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { name: 'asc' },
      }),
      this.genreRepository.count(where),
    ]);

    return new PaginatedResponseDto(
      genres.map((genre) => new GenreResponseDto(genre)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: number): Promise<GenreResponseDto> {
    const genre = await this.genreRepository.findById(id);
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }
    return new GenreResponseDto(genre);
  }

  async update(id: number, dto: UpdateGenreDto): Promise<GenreResponseDto> {
    const genre = await this.genreRepository.findById(id);
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    if (dto.slug && dto.slug !== genre.slug) {
      const existingSlug = await this.genreRepository.findBySlug(dto.slug);
      if (existingSlug) {
        throw new BadRequestException('Slug already exists');
      }
    }

    const updatedGenre = await this.genreRepository.update(id, dto);
    return new GenreResponseDto(updatedGenre);
  }

  async getListUsingSelect(
    listDto: GenreListDto,
  ): Promise<PaginatedResponseDto<{ id: number; name: string }>> {
    const page = listDto.page || 1;
    const limit = Number(listDto.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GenreWhereInput = {};

    if (listDto.search && listDto.search.data) {
      const keyword = listDto.search.data;
      where.OR = [{ name: { contains: keyword } }, { description: { contains: keyword } }];
    }

    const [items, total] = await Promise.all([
      this.genreRepository.getListUsingSelect({
        skip,
        take: limit,
        where,
        orderBy: { name: 'asc' },
      }),
      this.genreRepository.count(where),
    ]);

    return new PaginatedResponseDto(items, total, page, limit);
  }

  async remove(id: number): Promise<void> {
    const genre = await this.genreRepository.findById(id);
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }
    await this.genreRepository.delete(id);
  }

  async deleteMany(dto: DeleteManyDto): Promise<void> {
    await this.genreRepository.deleteMany(dto.ids);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

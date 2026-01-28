import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ArtistRepository } from '../repository/artist.repository';
import { CreateArtistDto, UpdateArtistDto, ArtistResponseDto, ArtistListDto } from '../dto';
import { Prisma, UserRole } from '@prisma/client';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class ArtistService {
  constructor(private readonly artistRepository: ArtistRepository) {}

  async create(dto: CreateArtistDto): Promise<ArtistResponseDto> {
    // Check if slug exists, if not generate from name
    let slug = dto.slug;
    if (!slug) {
      slug = this.generateSlug(dto.name);
    }

    // Ensure slug is unique
    const existingSlug = await this.artistRepository.findBySlug(slug);
    if (existingSlug) {
      throw new BadRequestException('Slug already exists');
    }

    const artist = await this.artistRepository.create({
      ...dto,
      slug,
    });

    return new ArtistResponseDto(artist);
  }

  async findAll(listDto: ArtistListDto): Promise<PaginatedResponseDto<ArtistResponseDto>> {
    const page = listDto.page || 1;
    const limit = Number(listDto.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ArtistWhereInput = {};

    // Filter by verified status
    if (listDto.verified !== undefined) {
      where.verified = listDto.verified;
    }

    // Search filter
    const VALID_SEARCH_FIELDS = ['name', 'slug', 'bio'];
    if (listDto.search?.data && listDto.search.fields?.length) {
      const searchConditions = listDto.search.fields
        .filter((field: string) => VALID_SEARCH_FIELDS.includes(field))
        .map((field: string) => ({
          [field]: { contains: listDto.search!.data },
        }));

      if (searchConditions.length > 0) {
        where.OR = searchConditions;
      }
    }

    // Build orderBy
    let orderBy: Prisma.ArtistOrderByWithRelationInput | Prisma.ArtistOrderByWithRelationInput[] = {
      createdAt: 'desc',
    };

    if (listDto.sorts?.length) {
      orderBy = listDto.sorts.map((sort) => ({
        [sort.field || 'createdAt']: sort.order?.toLowerCase() || 'desc',
      }));
    }

    const [artists, total] = await Promise.all([
      this.artistRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy,
      }),
      this.artistRepository.count(where),
    ]);

    return new PaginatedResponseDto(
      artists.map((artist) => new ArtistResponseDto(artist)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: number): Promise<ArtistResponseDto> {
    const artist = await this.artistRepository.findById(id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    return new ArtistResponseDto(artist);
  }

  async update(
    id: number,
    dto: UpdateArtistDto,
    currentUserId?: number,
    currentUserRole?: UserRole,
  ): Promise<ArtistResponseDto> {
    const artist = await this.artistRepository.findById(id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    // Check permission if not admin
    if (
      currentUserId &&
      currentUserRole &&
      currentUserRole !== UserRole.admin &&
      artist.userId !== currentUserId
    ) {
      throw new ForbiddenException('Bạn không có quyền cập nhật thông tin nghệ sĩ này');
    }

    if (dto.slug && dto.slug !== artist.slug) {
      const existingSlug = await this.artistRepository.findBySlug(dto.slug);
      if (existingSlug) {
        throw new BadRequestException('Slug already exists');
      }
    }

    const updatedArtist = await this.artistRepository.update(id, dto);
    return new ArtistResponseDto(updatedArtist);
  }

  async remove(id: number): Promise<void> {
    const artist = await this.artistRepository.findById(id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    await this.artistRepository.delete(id);
  }

  async removeMany(ids: number[]): Promise<void> {
    const artists = await this.artistRepository.findAll({
      where: {
        id: { in: ids },
      },
    });

    const foundIds = artists.map((artist) => artist.id);
    const missingIds = ids.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(`Artists with IDs [${missingIds.join(', ')}] not found`);
    }

    await this.artistRepository.deleteMany(ids);
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

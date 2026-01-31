import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AlbumRepository } from '../repository/album.repository';
import { CreateAlbumDto, UpdateAlbumDto, AlbumResponseDto } from '../dto';
import { DeleteManyDto } from '../../../common/dto/delete-many.dto';
import { AlbumListDto } from '../dto/album-list.dto';
import { ArtistRepository } from '../../artists/repository/artist.repository';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class AlbumService {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly artistRepository: ArtistRepository,
  ) {}

  async create(
    dto: CreateAlbumDto,
    currentUserId: number,
    currentUserRole: UserRole,
  ): Promise<AlbumResponseDto> {
    // 1. Check if Artist exists and Ownership check
    const artist = await this.artistRepository.findById(dto.artistId);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    if (currentUserRole !== UserRole.admin && artist.userId !== currentUserId) {
      throw new ForbiddenException('You can only create albums for your own artist profile');
    }

    // 2. Generate/Validate Slug
    let slug = dto.slug;
    if (!slug) {
      slug = this.generateSlug(dto.title);
    }

    const existingSlug = await this.albumRepository.findBySlug(slug);
    if (existingSlug) {
      throw new BadRequestException('Slug already exists');
    }

    // 3. Create Album
    // 3. Create Album
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { artistId, ...albumData } = dto;

    const album = await this.albumRepository.create({
      ...albumData,
      releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
      slug,
      artist: { connect: { id: dto.artistId } },
    });

    return new AlbumResponseDto(album);
  }

  async findAll(listDto: AlbumListDto): Promise<PaginatedResponseDto<AlbumResponseDto>> {
    const page = listDto.page || 1;
    const limit = Number(listDto.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AlbumWhereInput = {};

    if (listDto.isPublished !== undefined) {
      where.isPublished = listDto.isPublished;
    }

    if (listDto.artistId) {
      where.artistId = listDto.artistId;
    }

    if (listDto.search && listDto.search.data) {
      const keyword = listDto.search.data;
      where.OR = [{ title: { contains: keyword } }, { description: { contains: keyword } }];
    }

    const [albums, total] = await Promise.all([
      this.albumRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.albumRepository.count(where),
    ]);

    return new PaginatedResponseDto(
      albums.map((album) => new AlbumResponseDto(album)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: number): Promise<AlbumResponseDto> {
    const album = await this.albumRepository.findById(id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    return new AlbumResponseDto(album);
  }

  async update(
    id: number,
    dto: UpdateAlbumDto,
    currentUserId: number,
    currentUserRole: UserRole,
  ): Promise<AlbumResponseDto> {
    const album = await this.albumRepository.findById(id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // Ownership Check (indirectly via Artist)
    // Note: album.artist is included in findById
    const artist = await this.artistRepository.findById(album.artistId);
    if (!artist) {
      // Should not happen if data integrity is maintained
      throw new NotFoundException('Artist associated with this album not found');
    }

    if (currentUserRole !== UserRole.admin && artist.userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own albums');
    }

    if (dto.slug && dto.slug !== album.slug) {
      const existingSlug = await this.albumRepository.findBySlug(dto.slug);
      if (existingSlug) {
        throw new BadRequestException('Slug already exists');
      }
    }

    const updateData: any = { ...dto };
    if (dto.releaseDate) {
      updateData.releaseDate = new Date(dto.releaseDate);
    }

    const updatedAlbum = await this.albumRepository.update(id, updateData);
    return new AlbumResponseDto(updatedAlbum);
  }

  async remove(id: number, currentUserId: number, currentUserRole: UserRole): Promise<void> {
    const album = await this.albumRepository.findById(id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    const artist = await this.artistRepository.findById(album.artistId);
    if (currentUserRole !== UserRole.admin && artist?.userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own albums');
    }

    await this.albumRepository.delete(id);
  }

  async deleteMany(
    dto: DeleteManyDto,
    currentUserId: number,
    currentUserRole: UserRole,
  ): Promise<void> {
    const { ids } = dto;

    // If not admin, verify ownership of ALL targeted albums
    if (currentUserRole !== UserRole.admin) {
      const albums = await this.albumRepository.findAll({
        where: { id: { in: ids } },
      });

      for (const album of albums) {
        if (album.artist.userId !== currentUserId) {
          throw new ForbiddenException(`You do not own the album with ID ${album.id}`);
        }
      }
    }

    await this.albumRepository.deleteMany(ids);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

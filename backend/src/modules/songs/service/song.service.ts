import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateSongDto } from '../dto/create-song.dto';
import { UpdateSongDto } from '../dto/update-song.dto';
import { RejectSongDto } from '../dto/reject-song.dto';
import { SongRepository } from '../repository/song.repository';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { generateSlug } from '../../../common/utils/slug.util';

import { ArtistService } from '../../artists/service/artist.service';
import { User, UserRole, SongStatus, Prisma } from '@prisma/client';
import { SongListDto } from '../dto/song-list.dto';

@Injectable()
export class SongService {
  constructor(
    private readonly songRepository: SongRepository,
    private readonly artistService: ArtistService,
  ) {}

  async getListUsingSelect(
    listDto: SongListDto,
  ): Promise<PaginatedResponseDto<{ id: number; title: string }>> {
    const page = listDto.page || 1;
    const limit = Number(listDto.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SongWhereInput = {
      ...(listDto.status && { status: listDto.status }),
      ...(listDto.artistId && { primaryArtistId: listDto.artistId }), // Changed artistId to primaryArtistId based on schema
    };

    if (listDto.search && listDto.search.data) {
      const keyword = listDto.search.data;
      where.OR = [{ title: { contains: keyword } }];
    }

    const [items, total] = await Promise.all([
      this.songRepository.getListUsingSelect({
        skip,
        take: limit,
        where,
        orderBy: { title: 'asc' },
      }),
      this.songRepository.count(where),
    ]);

    return new PaginatedResponseDto(items, total, page, limit);
  }

  async create(createSongDto: CreateSongDto, user: User) {
    const { genreIds, artistId, albumId, featuredArtistIds, ...rest } = createSongDto;

    // Validate Artist exists
    const artist = await this.artistService.findOne(artistId);

    // Validate Ownership: If not admin, valid user must own the artist profile
    if (user.role !== UserRole.admin) {
      if (artist.userId !== user.id) {
        throw new ForbiddenException('Bạn không có quyền tạo bài hát cho nghệ sĩ này');
      }
    }

    // Validate Primary & Featured Artist conflict
    if (featuredArtistIds && featuredArtistIds.includes(artistId)) {
      throw new BadRequestException(
        'Nghệ sĩ chính không được trùng với nghệ sĩ hát cùng (Featured)',
      );
    }

    // Generate Slug
    let slug = generateSlug(rest.title);
    const existingSlug = await this.songRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Default status: pending for artist, approved for admin
    const status = user.role === UserRole.admin ? SongStatus.approved : SongStatus.pending;

    return this.songRepository.create({
      ...rest,
      slug,
      status,
      primaryArtist: {
        connect: { id: artistId },
      },
      ...(albumId && {
        album: {
          connect: { id: albumId },
        },
      }),
      ...(genreIds && {
        genres: {
          create: genreIds.map((id) => ({
            genre: { connect: { id } },
          })),
        },
      }),
      ...(featuredArtistIds && {
        songArtists: {
          create: featuredArtistIds.map((id) => ({
            artist: { connect: { id } },
            role: 'featured',
          })),
        },
      }),
    });
  }

  async findAll(listDto: SongListDto, user?: User): Promise<PaginatedResponseDto<any>> {
    const page = listDto.page || 1;
    const limit = Number(listDto.limit) || 10;

    // Public users can only see approved songs
    // Admin can see all or filter by status
    // Artist can use findMySongs for their own songs
    let effectiveStatus = listDto.status;

    if (!user || user.role === UserRole.user) {
      // Public/Regular users: only approved songs
      effectiveStatus = SongStatus.approved;
    } else if (user.role === UserRole.artist && !listDto.status) {
      // Artist without status filter: only approved songs (use findMySongs for own songs)
      effectiveStatus = SongStatus.approved;
    }
    // Admin can filter by any status or see all

    return this.songRepository.findAll(
      page,
      limit,
      typeof listDto.search === 'string' ? listDto.search : listDto.search?.data,
      listDto.artistId,
      listDto.albumId,
      listDto.genreId,
      effectiveStatus,
    );
  }

  async findMySongs(user: User, page: number, limit: number): Promise<PaginatedResponseDto<any>> {
    if (user.role !== UserRole.artist && user.role !== UserRole.admin) {
      throw new ForbiddenException('Chỉ nghệ sĩ mới có thể xem bài hát của mình');
    }
    return this.songRepository.findByArtistUserId(user.id, page, limit);
  }

  async findPending(page: number, limit: number): Promise<PaginatedResponseDto<any>> {
    const listDto = new SongListDto();
    listDto.page = page;
    listDto.limit = limit;
    listDto.status = SongStatus.pending;
    return this.findAll(listDto);
  }

  async findOne(id: number) {
    const song = await this.songRepository.findOne(id);
    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }
    return song;
  }

  async approve(id: number, user: User) {
    if (user.role !== UserRole.admin) {
      throw new ForbiddenException('Chỉ Admin mới có quyền duyệt bài hát');
    }

    const song = await this.findOne(id);

    if (song.status === SongStatus.approved) {
      throw new BadRequestException('Bài hát đã được duyệt trước đó');
    }

    return this.songRepository.update(id, {
      status: SongStatus.approved,
      rejectionReason: null,
      reviewedAt: new Date(),
      reviewedBy: user.id,
    });
  }

  async reject(id: number, rejectSongDto: RejectSongDto, user: User) {
    if (user.role !== UserRole.admin) {
      throw new ForbiddenException('Chỉ Admin mới có quyền từ chối bài hát');
    }

    const song = await this.findOne(id);

    if (song.status === SongStatus.rejected) {
      throw new BadRequestException('Bài hát đã bị từ chối trước đó');
    }

    return this.songRepository.update(id, {
      status: SongStatus.rejected,
      rejectionReason: rejectSongDto.rejectionReason || null,
      reviewedAt: new Date(),
      reviewedBy: user.id,
    });
  }

  async update(id: number, updateSongDto: UpdateSongDto, user: User) {
    const { artistId, albumId, title, featuredArtistIds, ...rest } = updateSongDto;

    // Validation for update
    const existingSong = await this.findOne(id); // Ensure exists

    // Validate Ownership
    if (user.role !== UserRole.admin) {
      // Must be owner of the current song's artist
      if (existingSong.primaryArtist.userId !== user.id) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài hát này');
      }
      // If changing artist, must own the new artist too
      if (artistId) {
        const newArtist = await this.artistService.findOne(artistId);
        if (newArtist.userId !== user.id) {
          throw new ForbiddenException('Bạn không có quyền chuyển bài hát sang nghệ sĩ này');
        }
      }
    }

    const targetPrimaryArtistId = artistId ?? existingSong.primaryArtist.id;
    if (featuredArtistIds && featuredArtistIds.includes(targetPrimaryArtistId)) {
      throw new BadRequestException(
        'Nghệ sĩ chính không được trùng với nghệ sĩ hát cùng (Featured)',
      );
    }

    // Handle Slug update if title changes
    let slug = undefined;
    if (title) {
      slug = generateSlug(title);
      const existingSlug = await this.songRepository.findBySlug(slug);
      if (existingSlug && existingSlug.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // If artist updates, reset to pending (unless admin)
    const shouldResetStatus =
      user.role !== UserRole.admin && existingSong.status === SongStatus.approved;

    return this.songRepository.update(id, {
      ...rest,
      ...(title && { title, slug }),
      ...(shouldResetStatus && { status: SongStatus.pending, reviewedAt: null, reviewedBy: null }),
      ...(artistId && {
        primaryArtist: {
          connect: { id: artistId },
        },
      }),
      ...(albumId && {
        album: {
          connect: { id: albumId },
        },
      }),
      ...(featuredArtistIds && {
        songArtists: {
          deleteMany: { role: 'featured' },
          create: featuredArtistIds.map((id) => ({
            artist: { connect: { id } },
            role: 'featured',
          })),
        },
      }),
    });
  }

  async remove(id: number, user: User) {
    const song = await this.findOne(id);

    // Validate Ownership
    if (user.role !== UserRole.admin) {
      if (song.primaryArtist.userId !== user.id) {
        throw new ForbiddenException('Bạn không có quyền xóa bài hát này');
      }
    }

    return this.songRepository.remove(id);
  }
}

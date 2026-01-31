/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AlbumService } from './album.service';
import { AlbumRepository } from '../repository/album.repository';
import { ArtistRepository } from '../../artists/repository/artist.repository';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateAlbumDto, UpdateAlbumDto } from '../dto';
import { AlbumListDto } from '../dto/album-list.dto';
import { DeleteManyDto } from '../../../common/dto/delete-many.dto';
import { UserRole } from '@prisma/client';

describe('AlbumService', () => {
  let service: AlbumService;
  let albumRepository: AlbumRepository;

  const mockArtist = {
    id: 1,
    userId: 1,
    name: 'Son Tung M-TP',
  };

  const mockAlbum = {
    id: 1,
    title: 'Future Nostalgia',
    slug: 'future-nostalgia',
    artistId: 1,
    artist: mockArtist,
    createdAt: new Date(),
    updatedAt: new Date(),
    songs: [],
  };

  const mockAlbumRepository = {
    create: jest.fn().mockResolvedValue(mockAlbum),
    findAll: jest.fn().mockResolvedValue([mockAlbum]),
    count: jest.fn().mockResolvedValue(1),
    findById: jest.fn().mockResolvedValue(mockAlbum),
    findBySlug: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(mockAlbum),
    delete: jest.fn().mockResolvedValue(mockAlbum),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };

  const mockArtistRepository = {
    findById: jest.fn().mockResolvedValue(mockArtist),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumService,
        {
          provide: AlbumRepository,
          useValue: mockAlbumRepository,
        },
        {
          provide: ArtistRepository,
          useValue: mockArtistRepository,
        },
      ],
    }).compile();

    service = module.get<AlbumService>(AlbumService);
    albumRepository = module.get<AlbumRepository>(AlbumRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new album for own artist', async () => {
      const createDto: CreateAlbumDto = {
        title: 'Future Nostalgia',
        artistId: 1,
        slug: 'future-nostalgia',
      };

      const result = await service.create(createDto, 1, UserRole.artist); // Artist owner
      expect(result).toEqual(
        expect.objectContaining({
          id: mockAlbum.id,
          title: mockAlbum.title,
        }),
      );
      expect(albumRepository.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if creating for another artist', async () => {
      const createDto: CreateAlbumDto = {
        title: 'Future Nostalgia',
        artistId: 1,
        slug: 'future-nostalgia',
      };

      // mockArtist.userId is 1
      await expect(service.create(createDto, 2, UserRole.artist)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin to create album for any artist', async () => {
      const createDto: CreateAlbumDto = {
        title: 'Future Nostalgia',
        artistId: 1,
        slug: 'future-nostalgia',
      };

      await expect(service.create(createDto, 2, UserRole.admin)).resolves.not.toThrow();
    });

    it('should throw BadRequestException if slug exists', async () => {
      jest.spyOn(albumRepository, 'findBySlug').mockResolvedValueOnce(mockAlbum as any);
      const createDto: CreateAlbumDto = {
        title: 'Future Nostalgia',
        artistId: 1,
        slug: 'future-nostalgia',
      };

      await expect(service.create(createDto, 1, UserRole.artist)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated list of albums', async () => {
      const listDto: AlbumListDto = { page: 1, limit: 10 };
      const result = await service.findAll(listDto);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(albumRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return album by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should throw NotFoundException if album not found', async () => {
      jest.spyOn(albumRepository, 'findById').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update album if owner', async () => {
      const updateDto: UpdateAlbumDto = { description: 'Updated' };
      const result = await service.update(1, updateDto, 1, UserRole.artist);
      expect(result).toBeDefined();
    });

    it('should update album if admin', async () => {
      const updateDto: UpdateAlbumDto = { description: 'Updated' };
      const result = await service.update(1, updateDto, 2, UserRole.admin);
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if not owner or admin', async () => {
      const updateDto: UpdateAlbumDto = { description: 'Updated' };
      await expect(service.update(1, updateDto, 2, UserRole.artist)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove album if owner', async () => {
      await service.remove(1, 1, UserRole.artist);
      expect(albumRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException if not owner or admin', async () => {
      await expect(service.remove(1, 2, UserRole.artist)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteMany', () => {
    it('should delete many albums if owner of all', async () => {
      const dto: DeleteManyDto = { ids: [1] };
      // findAll returns [mockAlbum] where artist.userId = 1
      await service.deleteMany(dto, 1, UserRole.artist);
      expect(albumRepository.deleteMany).toHaveBeenCalledWith([1]);
    });

    it('should throw ForbiddenException if not owner of one album', async () => {
      const dto: DeleteManyDto = { ids: [1] };
      await expect(service.deleteMany(dto, 2, UserRole.artist)).rejects.toThrow(ForbiddenException);
    });
  });
});

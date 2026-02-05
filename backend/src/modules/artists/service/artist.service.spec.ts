/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ArtistService } from './artist.service';
import { ArtistRepository } from '../repository/artist.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateArtistDto, UpdateArtistDto, ArtistListDto } from '../dto';
import { UserRole } from '@prisma/client';

describe('ArtistService', () => {
  let service: ArtistService;
  let repository: ArtistRepository;

  const mockArtist = {
    id: 1,
    name: 'Son Tung M-TP',
    slug: 'son-tung-m-tp',
    userId: 1,
    bio: 'Singer from Vietnam',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArtistRepository = {
    create: jest.fn().mockResolvedValue(mockArtist),
    findAll: jest.fn().mockResolvedValue([mockArtist]),
    count: jest.fn().mockResolvedValue(1),
    findById: jest.fn().mockResolvedValue(mockArtist),
    findByUserId: jest.fn().mockResolvedValue(null),
    findBySlug: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(mockArtist),
    delete: jest.fn().mockResolvedValue(mockArtist),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistService,
        {
          provide: ArtistRepository,
          useValue: mockArtistRepository,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ArtistService>(ArtistService);
    repository = module.get<ArtistRepository>(ArtistRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new artist', async () => {
      const createDto: CreateArtistDto = {
        name: 'Son Tung M-TP',
        userId: 1,
        slug: 'son-tung-m-tp',
      };

      const result = await service.create(createDto);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockArtist.id,
          name: mockArtist.name,
        }),
      );
      expect(repository.create).toHaveBeenCalled();
    });

    it('should generate slug if not provided', async () => {
      const createDto: CreateArtistDto = {
        name: 'Son Tung M-TP',
        userId: 1,
      };

      await service.create(createDto);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'son-tung-m-tp',
        }),
      );
    });

    it('should throw error if slug exists', async () => {
      jest.spyOn(repository, 'findBySlug').mockResolvedValueOnce(mockArtist as any);
      const createDto: CreateArtistDto = {
        name: 'Son Tung M-TP',
        userId: 1,
        slug: 'son-tung-m-tp',
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of artists', async () => {
      const listDto: ArtistListDto = { page: 1, limit: 10 };
      const result = await service.findAll(listDto);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return artist by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should throw NotFoundException if artist not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update artist if owner', async () => {
      const updateDto: UpdateArtistDto = { bio: 'Updated Bio' };
      const result = await service.update(1, updateDto, 1, UserRole.user);
      expect(result).toBeDefined();
    });

    it('should update artist if admin', async () => {
      const updateDto: UpdateArtistDto = { bio: 'Updated Bio' };
      const result = await service.update(1, updateDto, 2, UserRole.admin); // User 2 but Admin role
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if user is not owner and not admin', async () => {
      const updateDto: UpdateArtistDto = { bio: 'Updated Bio' };
      // mockArtist.userId is 1
      await expect(service.update(1, updateDto, 2, UserRole.user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete artist', async () => {
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});

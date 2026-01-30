import { Test, TestingModule } from '@nestjs/testing';
import { SongService } from './song.service';
import { SongRepository } from '../repository/song.repository';
import { ArtistService } from '../../artists/service/artist.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole, User } from '@prisma/client';
import { CreateSongDto } from '../dto/create-song.dto';
import { UpdateSongDto } from '../dto/update-song.dto';

describe('SongService', () => {
  let service: SongService;
  let songRepository: any;
  let artistService: any;

  const mockUserArtist: User = {
    id: 1,
    email: 'artist@test.com',
    role: UserRole.artist,
    username: 'artist',
    passwordHash: 'hash',
    displayName: 'Artist User',
    avatarUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    otpCode: null,
    otpExpiresAt: null,
    emailVerified: true,
    dateOfBirth: null,
    country: null,
    subscriptionType: 'free',
  };

  const mockUserAdmin: User = {
    ...mockUserArtist,
    id: 2,
    role: UserRole.admin,
  };

  const mockUserOther: User = {
    ...mockUserArtist,
    id: 3,
  };

  beforeEach(async () => {
    songRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    artistService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongService,
        { provide: SongRepository, useValue: songRepository },
        { provide: ArtistService, useValue: artistService },
      ],
    }).compile();

    service = module.get<SongService>(SongService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSongDto = {
      title: 'Test Song',
      artistId: 10,
      audioUrl: 'http://audio.url',
      durationMs: 3000,
    };

    it('should create song successfully for Admin', async () => {
      artistService.findOne.mockResolvedValue({ id: 10, userId: 99 } as any);
      songRepository.create.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto, mockUserAdmin);

      expect(result).toBeDefined();
      expect(songRepository.create).toHaveBeenCalled();
    });

    it('should create song successfully for Owner Artist', async () => {
      artistService.findOne.mockResolvedValue({ id: 10, userId: mockUserArtist.id } as any);
      songRepository.create.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto, mockUserArtist);

      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if Artist User does not own the Artist profile', async () => {
      artistService.findOne.mockResolvedValue({ id: 10, userId: 99 } as any); // Owned by user 99

      await expect(service.create(createDto, mockUserArtist)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if Primary Artist is in Featured Artists', async () => {
      const conflictDto = { ...createDto, featuredArtistIds: [10, 11] }; // 10 is primary
      artistService.findOne.mockResolvedValue({ id: 10, userId: mockUserAdmin.id } as any);

      await expect(service.create(conflictDto, mockUserAdmin)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSongDto = { title: 'Updated Title' };
    const mockSong = {
      id: 1,
      title: 'Old Title',
      primaryArtist: { id: 10, userId: mockUserArtist.id },
    };

    it('should update successfully for Admin', async () => {
      songRepository.findOne.mockResolvedValue(mockSong);
      songRepository.update.mockResolvedValue({ ...mockSong, ...updateDto });

      const result = await service.update(1, updateDto, mockUserAdmin);
      expect(result).toBeDefined();
    });

    it('should update successfully for Owner Artist', async () => {
      songRepository.findOne.mockResolvedValue(mockSong);
      songRepository.update.mockResolvedValue({ ...mockSong, ...updateDto });

      const result = await service.update(1, updateDto, mockUserArtist);
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if User is not Owner', async () => {
      songRepository.findOne.mockResolvedValue(mockSong); // Owned by mockUserArtist

      await expect(service.update(1, updateDto, mockUserOther)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if changing to Artist not owned by User', async () => {
      songRepository.findOne.mockResolvedValue(mockSong);
      artistService.findOne.mockResolvedValue({ id: 20, userId: 99 } as any); // New artist owned by 99

      await expect(service.update(1, { artistId: 20 }, mockUserArtist)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    const mockSong = {
      id: 1,
      primaryArtist: { id: 10, userId: mockUserArtist.id },
    };

    it('should remove successfully for Admin', async () => {
      songRepository.findOne.mockResolvedValue(mockSong);
      songRepository.remove.mockResolvedValue(mockSong);

      const result = await service.remove(1, mockUserAdmin);
      expect(result).toBeDefined();
    });

    it('should remove successfully for Owner Artist', async () => {
      songRepository.findOne.mockResolvedValue(mockSong);
      songRepository.remove.mockResolvedValue(mockSong);

      const result = await service.remove(1, mockUserArtist);
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if User is not Owner', async () => {
      songRepository.findOne.mockResolvedValue(mockSong);

      await expect(service.remove(1, mockUserOther)).rejects.toThrow(ForbiddenException);
    });
  });
});

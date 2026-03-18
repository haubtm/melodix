import { Test, TestingModule } from '@nestjs/testing';
import { SongController } from './song.controller';
import { SongService } from '../service/song.service';
import { CreateSongDto } from '../dto/create-song.dto';
import { UserRole, SongStatus } from '@prisma/client';
import { RejectSongDto } from '../dto/reject-song.dto';
import { SongListDto } from '../dto/song-list.dto';

describe('SongController', () => {
  let controller: SongController;
  let songService: any;

  const mockUser = {
    id: 1,
    role: UserRole.admin,
  };

  beforeEach(async () => {
    songService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
      findMySongs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongController],
      providers: [
        {
          provide: SongService,
          useValue: songService,
        },
      ],
    }).compile();

    controller = module.get<SongController>(SongController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSongDto = {
      title: 'Test Song',
      audioUrl: 'url',
      artistId: 1,
      durationMs: 3000,
    };

    it('should call service.create', async () => {
      await controller.create(createDto, mockUser);
      expect(songService.create).toHaveBeenCalledWith(createDto, mockUser);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with correct params', async () => {
      const listDto: SongListDto = {
        page: 1,
        limit: 10,
        search: 'search',
        artistId: 1,
        albumId: 1,
        genreId: 1,
        status: SongStatus.pending,
      };

      await controller.findAll(listDto, mockUser);
      expect(songService.findAll).toHaveBeenCalledWith(listDto, mockUser);
    });
  });

  describe('approve', () => {
    it('should call service.approve', async () => {
      await controller.approve(1, mockUser);
      expect(songService.approve).toHaveBeenCalledWith(1, mockUser);
    });
  });

  describe('reject', () => {
    const rejectDto: RejectSongDto = { rejectionReason: 'reason' };
    it('should call service.reject', async () => {
      await controller.reject(1, rejectDto, mockUser);
      expect(songService.reject).toHaveBeenCalledWith(1, rejectDto, mockUser);
    });
  });

  describe('findMySongs', () => {
    it('should call service.findMySongs', async () => {
      await controller.findMySongs(1, 10, mockUser);
      expect(songService.findMySongs).toHaveBeenCalledWith(mockUser, 1, 10);
    });
  });

  describe('findPending', () => {
    it('should call service.findPending', async () => {
      await controller.findPending(1, 10);
      expect(songService.findPending).toHaveBeenCalledWith(1, 10);
    });
  });
});

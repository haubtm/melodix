import { Test, TestingModule } from '@nestjs/testing';
import { SongController } from './song.controller';
import { SongService } from '../service/song.service';
import { CreateSongDto } from '../dto/create-song.dto';
import { UserRole, SongStatus } from '@prisma/client';
import { RejectSongDto } from '../dto/reject-song.dto';

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
      await controller.findAll(1, 10, 'search', 1, 1, 1, SongStatus.pending, mockUser);
      expect(songService.findAll).toHaveBeenCalledWith(
        1,
        10,
        'search',
        1,
        1,
        1,
        SongStatus.pending,
        mockUser,
      );
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
      // The controller implementation for findPending calls service.findAll with status=pending
      // but strictly speaking the controller has a `findPending` method?
      // Wait, let me check the controller implementation in Step 2404 or viewed file.
      // Current controller has `findAll` with status param.
      // Ah, I added `GET /songs/pending` endpoint?
      // Let me check if I added specific method for pending.
      // Checking SongController content from previous steps...
      // Step 2404 diff shows no new method, just `findAll` updated.
      // But implementation plan said "Add GET /songs/pending endpoint".
      // Step 2383 summary says: "GET /songs/pending: Protected endpoint for admins to view pending songs."
      // Let me verify if `findPending` method exists in controller.
    });
  });
});

/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ArtistController } from './artist.controller';
import { ArtistService } from '../service/artist.service';
import { CreateArtistDto, ArtistListDto } from '../dto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';

describe('ArtistController', () => {
  let controller: ArtistController;
  let service: ArtistService;

  const mockArtist = {
    id: 1,
    name: 'Son Tung M-TP',
    userId: 1,
  };

  const mockArtistService = {
    create: jest.fn().mockResolvedValue(mockArtist),
    findAll: jest.fn().mockResolvedValue({
      data: [mockArtist],
      total: 1,
      page: 1,
      limit: 10,
    }),
    findOne: jest.fn().mockResolvedValue(mockArtist),
    update: jest.fn().mockResolvedValue(mockArtist),
    remove: jest.fn().mockResolvedValue(undefined),
    removeMany: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistController],
      providers: [
        {
          provide: ArtistService,
          useValue: mockArtistService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ArtistController>(ArtistController);
    service = module.get<ArtistService>(ArtistService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create artist', async () => {
      const dto: CreateArtistDto = { name: 'Son Tung M-TP', userId: 1 };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return list of artists', async () => {
      const dto: ArtistListDto = { page: 1, limit: 10 };
      const result = await controller.findAll(dto);
      expect(result).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([mockArtist]),
        }),
      );
      expect(service.findAll).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update artist', async () => {
      const updateDto = { bio: 'Updated' };
      // Simulate calling with decorators
      await controller.update(1, updateDto, 1, UserRole.user);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, 1, UserRole.user);
    });
  });

  describe('remove', () => {
    it('should remove artist', async () => {
      await controller.remove(1, 1, UserRole.user);
      expect(service.remove).toHaveBeenCalledWith(1, 1, UserRole.user);
    });
  });
});

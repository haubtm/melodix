/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AlbumController } from './album.controller';
import { AlbumService } from '../service/album.service';
import { CreateAlbumDto, UpdateAlbumDto } from '../dto';
import { AlbumListDto } from '../dto/album-list.dto';
import { DeleteManyDto } from '../../../common/dto/delete-many.dto';
import { UserRole } from '@prisma/client';
import { PaginatedResponseDto } from '../../../common/dto';

describe('AlbumController', () => {
  let controller: AlbumController;
  let service: AlbumService;

  const mockAlbumResponse = {
    id: 1,
    title: 'Future Nostalgia',
    artistId: 1,
  };

  const mockAlbumService = {
    create: jest.fn().mockResolvedValue(mockAlbumResponse),
    findAll: jest.fn().mockResolvedValue(new PaginatedResponseDto([mockAlbumResponse], 1, 1, 10)),
    findOne: jest.fn().mockResolvedValue(mockAlbumResponse),
    update: jest.fn().mockResolvedValue(mockAlbumResponse),
    remove: jest.fn().mockResolvedValue(undefined),
    deleteMany: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumController],
      providers: [
        {
          provide: AlbumService,
          useValue: mockAlbumService,
        },
      ],
    }).compile();

    controller = module.get<AlbumController>(AlbumController);
    service = module.get<AlbumService>(AlbumService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an album', async () => {
      const dto: CreateAlbumDto = {
        title: 'New Album',
        artistId: 1,
      };

      await controller.create(dto, 1, UserRole.artist);
      expect(service.create).toHaveBeenCalledWith(dto, 1, UserRole.artist);
    });
  });

  describe('findAll', () => {
    it('should return list of albums', async () => {
      const query: AlbumListDto = { page: 1, limit: 10 };
      await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return an album', async () => {
      await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an album', async () => {
      const dto: UpdateAlbumDto = { title: 'Updated' };
      await controller.update(1, dto, 1, UserRole.artist);
      expect(service.update).toHaveBeenCalledWith(1, dto, 1, UserRole.artist);
    });
  });

  describe('remove', () => {
    it('should remove an album', async () => {
      await controller.remove(1, 1, UserRole.artist);
      expect(service.remove).toHaveBeenCalledWith(1, 1, UserRole.artist);
    });
  });

  describe('removeMany', () => {
    it('should remove multiple albums', async () => {
      const dto: DeleteManyDto = { ids: [1, 2] };
      await controller.removeMany(dto, 1, UserRole.artist);
      expect(service.deleteMany).toHaveBeenCalledWith(dto, 1, UserRole.artist);
    });
  });
});

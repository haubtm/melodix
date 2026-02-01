import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from '../service/playlist.service';
import { CreatePlaylistDto, UpdatePlaylistDto, AddSongsDto } from '../dto';

describe('PlaylistController', () => {
  let controller: PlaylistController;
  let service: Partial<Record<keyof PlaylistService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      addSongs: jest.fn(),
      removeSong: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistController],
      providers: [
        {
          provide: PlaylistService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<PlaylistController>(PlaylistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreatePlaylistDto = { name: 'My Playlist' };
      const userId = 1;
      await controller.create(dto, userId);
      expect(service.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      await controller.findAll(1, 10, 'test');
      expect(service.findAll).toHaveBeenCalledWith(1, 10, 'test');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      await controller.findOne(1, 1);
      expect(service.findOne).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto: UpdatePlaylistDto = { name: 'New Name' };
      await controller.update(1, dto, 1);
      expect(service.update).toHaveBeenCalledWith(1, dto, 1);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      await controller.remove(1, 1);
      expect(service.remove).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('addSongs', () => {
    it('should call service.addSongs', async () => {
      const dto: AddSongsDto = { songIds: [1, 2] };
      await controller.addSongs(1, dto, 1);
      expect(service.addSongs).toHaveBeenCalledWith(1, dto, 1);
    });
  });

  describe('removeSong', () => {
    it('should call service.removeSong', async () => {
      await controller.removeSong(1, 2, 1);
      expect(service.removeSong).toHaveBeenCalledWith(1, 2, 1);
    });
  });
});

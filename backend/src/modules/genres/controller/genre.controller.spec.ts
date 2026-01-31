/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GenreController } from './genre.controller';
import { GenreService } from '../service/genre.service';
import { CreateGenreDto, GenreListDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';

describe('GenreController', () => {
  let controller: GenreController;
  let service: GenreService;

  const mockService = {
    create: jest.fn().mockResolvedValue({ id: 1 }),
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
    update: jest.fn().mockResolvedValue({ id: 1 }),
    remove: jest.fn().mockResolvedValue(undefined),
    deleteMany: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenreController],
      providers: [
        {
          provide: GenreService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GenreController>(GenreController);
    service = module.get<GenreService>(GenreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create genre', async () => {
      const dto: CreateGenreDto = { name: 'Pop' };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return list', async () => {
      const dto = new GenreListDto();
      await controller.findAll(dto);
      expect(service.findAll).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should return one', async () => {
      await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update', async () => {
      await controller.update(1, { name: 'Up' });
      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove', async () => {
      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('removeMany', () => {
    it('should remove many', async () => {
      await controller.removeMany({ ids: [1, 2] });
      expect(service.deleteMany).toHaveBeenCalled();
    });
  });
});

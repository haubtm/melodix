/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GenreService } from './genre.service';
import { GenreRepository } from '../repository/genre.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GenreListDto } from '../dto';

describe('GenreService', () => {
  let service: GenreService;
  let repository: GenreRepository;

  const mockGenre = {
    id: 1,
    name: 'Pop',
    slug: 'pop',
    description: 'Pop music',
    imageUrl: 'image.jpg',
    color: '#000',
    createdAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockResolvedValue(mockGenre),
    findAll: jest.fn().mockResolvedValue([mockGenre]),
    count: jest.fn().mockResolvedValue(1),
    findById: jest.fn().mockResolvedValue(mockGenre),
    findBySlug: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(mockGenre),
    delete: jest.fn().mockResolvedValue(mockGenre),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        {
          provide: GenreRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GenreService>(GenreService);
    repository = module.get<GenreRepository>(GenreRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      const dto = { name: 'Pop' };
      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw error if slug exists', async () => {
      mockRepository.findBySlug.mockResolvedValueOnce(mockGenre);
      await expect(service.create({ name: 'Pop', slug: 'pop' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return list of genres', async () => {
      const dto = new GenreListDto();
      const result = await service.findAll(dto);
      expect(result.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a genre', async () => {
      const result = await service.findOne(1);
      expect(result).toBeDefined();
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if genre not found', async () => {
      mockRepository.findById.mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockGenre);
      const result = await service.update(1, { name: 'Updated' });
      expect(result).toBeDefined();
      expect(repository.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if new slug exists', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockGenre);
      mockRepository.findBySlug.mockResolvedValueOnce({ ...mockGenre, id: 2 } as any);
      await expect(service.update(1, { slug: 'exists' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockGenre);
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple genres', async () => {
      await service.deleteMany({ ids: [1, 2] });
      expect(repository.deleteMany).toHaveBeenCalledWith([1, 2]);
    });
  });
});

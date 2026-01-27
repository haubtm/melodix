import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repository';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock encryption
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUserRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  findActiveById: jest.fn(),
  findById: jest.fn(),
  findByEmailOrUsername: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  softDeleteMany: jest.fn(),
  updatePassword: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let userRepository: typeof mockUserRepository;
  let configService: typeof mockConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    configService = module.get(ConfigService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      displayName: 'Test User',
      country: 'VN',
      role: 'user' as const,
    };

    it('should create a user successfully', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue({ id: 1, ...createUserDto });

      const result = await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(createUserDto.email);
    });

    it('should throw ConflictException if email exists', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue({ email: createUserDto.email });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [
        { id: 1, email: 'a@a.com' },
        { id: 2, email: 'b@b.com' },
      ];
      userRepository.findAll.mockResolvedValue(users);
      userRepository.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(userRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      userRepository.findActiveById.mockResolvedValue({ id: 1, email: 'test@example.com' });

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      userRepository.findActiveById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      userRepository.findById.mockResolvedValue({ id: 2, username: 'user2' });
      configService.get.mockReturnValue('admin');

      await service.remove(2);

      expect(userRepository.softDelete).toHaveBeenCalledWith(2);
    });

    it('should throw ForbiddenException if trying to delete admin', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, username: 'admin' });
      configService.get.mockReturnValue('admin');

      await expect(service.remove(1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeMany', () => {
    it('should delete multiple users successfully', async () => {
      const ids = [2, 3];
      const users = [
        { id: 2, username: 'user2' },
        { id: 3, username: 'user3' },
      ];
      userRepository.findAll.mockResolvedValue(users);
      configService.get.mockReturnValue('admin');

      await service.removeMany(ids);

      expect(userRepository.softDeleteMany).toHaveBeenCalledWith(ids);
    });

    it('should throw NotFoundException if some users not found', async () => {
      const ids = [2, 999];
      const users = [{ id: 2, username: 'user2' }];
      userRepository.findAll.mockResolvedValue(users);

      await expect(service.removeMany(ids)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if list contains admin', async () => {
      const ids = [1, 2];
      const users = [
        { id: 1, username: 'admin' },
        { id: 2, username: 'user2' },
      ];
      userRepository.findAll.mockResolvedValue(users);
      configService.get.mockReturnValue('admin');

      await expect(service.removeMany(ids)).rejects.toThrow(ForbiddenException);
    });
  });
});

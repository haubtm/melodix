import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../service';
import { CreateUserDto, UpdateUserDto, UserListDto, DeleteManyDto } from '../dto';
import { UserRole } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    removeMany: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call userService.create', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        username: 'test',
        password: 'password',
        displayName: 'Test',
      };
      const result = { id: 1, ...dto, role: UserRole.user, createdAt: new Date() } as any;
      mockUserService.create.mockResolvedValue(result);

      await controller.create(dto);

      expect(mockUserService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call userService.findAll', async () => {
      const dto: UserListDto = { page: 1, limit: 10 };
      const result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockUserService.findAll.mockResolvedValue(result);

      await controller.findAll(dto);

      expect(mockUserService.findAll).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should call userService.findOne', async () => {
      const id = 1;
      mockUserService.findOne.mockResolvedValue({ id });

      await controller.findOne(id);

      expect(mockUserService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should call userService.update if admin', async () => {
      const id = 1;
      const dto: UpdateUserDto = { displayName: 'New Name' };
      const currentUserId = 2;
      const currentUserRole = UserRole.admin;

      mockUserService.update.mockResolvedValue({ id, ...dto });

      await controller.update(id, dto, currentUserId, currentUserRole);

      expect(mockUserService.update).toHaveBeenCalledWith(id, dto);
    });

    it('should call userService.update if owner', async () => {
      const id = 1;
      const dto: UpdateUserDto = { displayName: 'New Name' };
      const currentUserId = 1;
      const currentUserRole = UserRole.user;

      mockUserService.update.mockResolvedValue({ id, ...dto });

      await controller.update(id, dto, currentUserId, currentUserRole);

      expect(mockUserService.update).toHaveBeenCalledWith(id, dto);
    });

    it('should throw ForbiddenException if not admin and not owner', async () => {
      const id = 1;
      const dto: UpdateUserDto = { displayName: 'New Name' };
      const currentUserId = 2;
      const currentUserRole = UserRole.user;

      await expect(controller.update(id, dto, currentUserId, currentUserRole)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('removeMany', () => {
    it('should call userService.removeMany', async () => {
      const dto: DeleteManyDto = { ids: [1, 2] };
      mockUserService.removeMany.mockResolvedValue(undefined);

      await controller.removeMany(dto);

      expect(mockUserService.removeMany).toHaveBeenCalledWith(dto.ids);
    });
  });

  describe('remove', () => {
    it('should call userService.remove', async () => {
      const id = 1;
      mockUserService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockUserService.remove).toHaveBeenCalledWith(id);
    });
  });
});

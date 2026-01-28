import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../mail/mail.service';
import { UserRepository } from '../../users/repository/user.repository';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt globally
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUserRepository = {
  findByEmailOrUsername: jest.fn(),
  create: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn(),
  findActiveById: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockMailService = {
  sendOtp: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: typeof mockUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      displayName: 'Test User',
    };

    it('should register a new user successfully', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ id: 1, ...registerDto });

      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(userRepository.findByEmailOrUsername).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.username,
      );
      expect(userRepository.create).toHaveBeenCalled();
      expect(mockMailService.sendOtp).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('should throw ConflictException if user exists', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      usernameOrEmail: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      emailVerified: true,
      isActive: true,
      role: 'user',
    };

    it('should login successfully and return tokens', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue(mockUser);
      // Mock bcrypt compare
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue({ ...mockUser, emailVerified: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('changePassword', () => {
    const userId = 1;
    const changePasswordDto = {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    };

    const mockUser = {
      id: userId,
      passwordHash: 'hashedOldPassword',
    };

    it('should change password successfully', async () => {
      userRepository.findActiveById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      userRepository.updatePassword.mockResolvedValue(mockUser);

      const result = await service.changePassword(userId, changePasswordDto);

      expect(userRepository.findActiveById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.oldPassword,
        mockUser.passwordHash,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
      expect(userRepository.updatePassword).toHaveBeenCalledWith(userId, 'hashedNewPassword');
      expect(result).toEqual({ message: 'Đổi mật khẩu thành công' });
    });

    it('should throw BadRequestException if new password and confirm password do not match', async () => {
      const invalidDto = { ...changePasswordDto, confirmPassword: 'wrongPassword' };
      await expect(service.changePassword(userId, invalidDto)).rejects.toThrow(
        'Mật khẩu xác nhận không khớp',
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findActiveById.mockResolvedValue(null);
      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw BadRequestException if old password is incorrect', async () => {
      userRepository.findActiveById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(
        'Mật khẩu cũ không chính xác',
      );
    });
  });

  describe('getProfile', () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      username: 'test',
      passwordHash: 'hashedPassword',
      role: 'user',
    };

    it('should return user profile and tokens', async () => {
      userRepository.findActiveById.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.getProfile(userId);

      expect(userRepository.findActiveById).toHaveBeenCalledWith(userId);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findActiveById.mockResolvedValue(null);
      await expect(service.getProfile(userId)).rejects.toThrow('User not found');
    });
  });
});

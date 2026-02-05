import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '@nestjs/config';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from '../dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    verifyEmail: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    verifyForgotPasswordOtp: jest.fn(),
    resetPassword: jest.fn(),
    refresh: jest.fn(),
    changePassword: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        username: 'test',
        password: 'password',
        displayName: 'Test',
      };
      mockAuthService.register.mockResolvedValue({ message: 'sent' });

      await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail', async () => {
      const dto: VerifyEmailDto = { email: 'test@example.com', otp: '123456' };
      mockAuthService.verifyEmail.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      await controller.verifyEmail(dto);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto: LoginDto = { usernameOrEmail: 'test', password: 'password' };
      mockAuthService.login.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      const dto: ForgotPasswordDto = { email: 'test@example.com' };
      mockAuthService.forgotPassword.mockResolvedValue({ message: 'sent' });

      await controller.forgotPassword(dto);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('verifyForgotPassword', () => {
    it('should call authService.verifyForgotPasswordOtp', async () => {
      const dto: VerifyEmailDto = { email: 'test@example.com', otp: '123456' };
      mockAuthService.verifyForgotPasswordOtp.mockResolvedValue({ message: 'verified' });

      await controller.verifyForgotPassword(dto);

      expect(mockAuthService.verifyForgotPasswordOtp).toHaveBeenCalledWith(dto);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      const dto: ResetPasswordDto = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'new',
      };
      mockAuthService.resetPassword.mockResolvedValue({ message: 'reset' });

      await controller.resetPassword(dto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'rt' };
      mockAuthService.refresh.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      await controller.refresh(dto);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(dto);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword', async () => {
      const dto: ChangePasswordDto = {
        oldPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'new',
      };
      const req = { user: { id: 1 } };
      mockAuthService.changePassword.mockResolvedValue({ message: 'changed' });

      await controller.changePassword(req, dto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile', async () => {
      const req = { user: { id: 1 } };
      mockAuthService.getProfile.mockResolvedValue({ id: 1, email: 'test' });

      await controller.getProfile(req);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
    });
  });
});

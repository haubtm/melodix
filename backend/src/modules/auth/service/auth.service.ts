import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../users/repository/user.repository';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from '../dto';
import { UserEntity } from '../../users/entity';

import { MailService } from '../../mail/mail.service';
import { USER_ERRORS } from '../../users/constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, username, password, displayName } = registerDto;

    // Check existing
    const existingUser = await this.userRepository.findByEmailOrUsername(email, username);
    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create inactive user
    await this.userRepository.create({
      email,
      username,
      passwordHash,
      displayName,
      emailVerified: false,
      otpCode,
      otpExpiresAt,
    } as any);

    // Send Email
    await this.mailService.sendOtp(email, otpCode);

    return {
      message: 'Registration successful. Please check your email for OTP verification.',
    };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, otp } = verifyEmailDto;

    const user = (await this.userRepository.findByEmail(email)) as any;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new ConflictException('Email already verified');
    }

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    // Activate user
    await this.userRepository.update(user.id, {
      emailVerified: true,
      isActive: true,
      otpCode: null,
      otpExpiresAt: null,
    } as any);

    // Generate tokens
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { usernameOrEmail, password } = loginDto;

    const user = await this.userRepository.findByEmailOrUsername(usernameOrEmail, usernameOrEmail);
    if (!user) {
      throw new UnauthorizedException(USER_ERRORS.INVALID_CREDENTIALS);
    }

    // Check password
    if (!user.passwordHash) {
      throw new UnauthorizedException(USER_ERRORS.INVALID_CREDENTIALS);
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(USER_ERRORS.INVALID_CREDENTIALS);
    }

    // Check verification
    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(USER_ERRORS.ACCOUNT_DISABLED);
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }), // Short lived
      this.jwtService.signAsync(payload, {
        expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') || '7d') as any,
        secret: this.configService.get<string>('jwt.refreshSecret'),
      }), // Long lived
    ]);

    return { accessToken, refreshToken };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const user = (await this.userRepository.findByEmail(email)) as any;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.update(user.id, {
      otpCode,
      otpExpiresAt,
    } as any);

    await this.mailService.sendForgotPasswordOtp(email, otpCode);

    return { message: 'OTP sent to your email' };
  }

  async verifyForgotPasswordOtp(verifyDto: VerifyEmailDto): Promise<{ message: string }> {
    const { email, otp } = verifyDto;
    const user = (await this.userRepository.findByEmail(email)) as any;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(resetDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = resetDto;
    const user = (await this.userRepository.findByEmail(email)) as any;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(user.id, {
      passwordHash,
      otpCode: null,
      otpExpiresAt: null,
    } as any);

    return { message: 'Password reset successful' };
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = (await this.userRepository.findActiveById(payload.sub)) as any;
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    const user = await this.userRepository.findActiveById(userId);
    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(userId, passwordHash);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async getProfile(userId: number): Promise<any> {
    const user = await this.userRepository.findActiveById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const tokens = await this.generateTokens(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user as any;
    return {
      ...result,
      ...tokens,
    };
  }

  async oauthLogin(oauthData: {
    provider: string;
    providerId: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    const user = await this.userRepository.findOrCreateOAuthUser(oauthData);

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const tokens = await this.generateTokens(user);
    return { ...tokens, user };
  }
}

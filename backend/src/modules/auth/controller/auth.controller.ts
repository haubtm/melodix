import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthService } from '../service';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from '../dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { GoogleAuthGuard } from '../guard/google-auth.guard';
import { FacebookAuthGuard } from '../guard/facebook-auth.guard';
import { UseGuards, Get, Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered, OTP sent' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with OTP' })
  @ApiResponse({ status: 200, description: 'Email verified, tokens returned' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful, tokens returned' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Post('verify-forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify forgot password OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified' })
  async verifyForgotPassword(@Body() dto: VerifyEmailDto) {
    return await this.authService.verifyForgotPasswordOtp(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return await this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return await this.authService.changePassword(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  async getProfile(@Request() req: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    return await this.authService.getProfile(userId);
  }

  // =====================================================
  // GOOGLE OAUTH
  // =====================================================

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirect to Google OAuth' })
  @ApiExcludeEndpoint()
  googleAuth() {
    // Guard will redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  async googleCallback(@Request() req: any, @Res() res: Response) {
    const result = await this.authService.oauthLogin({
      provider: req.user.provider,
      providerId: req.user.providerId,
      email: req.user.email,
      displayName: req.user.displayName,
      avatarUrl: req.user.avatarUrl,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    });

    // Redirect to frontend with tokens
    const frontendUrl =
      this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(redirectUrl);
  }

  // =====================================================
  // FACEBOOK OAUTH
  // =====================================================

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Redirect to Facebook OAuth' })
  @ApiExcludeEndpoint()
  facebookAuth() {
    // Guard will redirect to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiExcludeEndpoint()
  async facebookCallback(@Request() req: any, @Res() res: Response) {
    const result = await this.authService.oauthLogin({
      provider: req.user.provider,
      providerId: req.user.providerId,
      email: req.user.email,
      displayName: req.user.displayName,
      avatarUrl: req.user.avatarUrl,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    });

    // Redirect to frontend with tokens
    const frontendUrl =
      this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(redirectUrl);
  }
}

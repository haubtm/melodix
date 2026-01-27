import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(to: string, otp: string) {
    const from = this.configService.get<string>('mail.from');
    await this.mailerService.sendMail({
      to,
      from,
      subject: 'Melodix Verification Code',
      text: `Your OTP verification code is: ${otp}. This code expires in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Melodix!</h2>
          <p>Your OTP verification code is:</p>
          <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
          <p>This code expires in 15 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendForgotPasswordOtp(to: string, otp: string) {
    const from = this.configService.get<string>('mail.from');
    await this.mailerService.sendMail({
      to,
      from,
      subject: 'Reset Password Verification Code',
      text: `Your password reset OTP is: ${otp}. This code expires in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Password Request</h2>
          <p>Your password reset OTP is:</p>
          <h1 style="color: #F44336; font-size: 32px;">${otp}</h1>
          <p>This code expires in 15 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });
  }
}

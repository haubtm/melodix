import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controller';
import { AuthService } from './service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { FacebookStrategy } from './strategy/facebook.strategy';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: (configService.get<string>('jwt.expiresIn') || '15m') as any },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, FacebookStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

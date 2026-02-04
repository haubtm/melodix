import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('oauth.google.clientId') || '',
      clientSecret: configService.get<string>('oauth.google.clientSecret') || '',
      callbackURL: configService.get<string>('oauth.google.callbackUrl') || '',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { id, emails, displayName, photos } = profile;
    const user = {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value || null,
      displayName: displayName || null,
      avatarUrl: photos?.[0]?.value || null,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('oauth.facebook.appId') || '',
      clientSecret: configService.get<string>('oauth.facebook.appSecret') || '',
      callbackURL: configService.get<string>('oauth.facebook.callbackUrl') || '',
      scope: ['email'],
      profileFields: ['id', 'emails', 'displayName', 'photos'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: any) => void,
  ): void {
    const { id, emails, displayName, photos } = profile;
    const user = {
      provider: 'facebook',
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

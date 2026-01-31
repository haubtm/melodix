import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { ArtistsModule } from './modules/artists/artists.module';
import { UploadModule } from './modules/upload/upload.module';
import { AlbumsModule } from './modules/albums/albums.module';
import { SongsModule } from './modules/songs/songs.module';
import { appConfig, jwtConfig, oauthConfig } from './config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, oauthConfig],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),

    // Database
    PrismaModule,

    // Feature Modules
    UsersModule,
    AuthModule,
    MailModule,
    ArtistsModule,
    AlbumsModule,
    SongsModule,
    // GenresModule,
    // PlaylistsModule,
    // LibraryModule,
    // PlaybackModule,
    // SyncModule,
    // SubscriptionsModule,
    // AdsModule,
    // SearchModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

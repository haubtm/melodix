import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SongsModule } from '../songs/songs.module';
import { PlaybackController } from './controller/playback.controller';
import { PlaybackRepository } from './repository/playback.repository';
import { PlaybackService } from './service/playback.service';

@Module({
  imports: [PrismaModule, SongsModule],
  controllers: [PlaybackController],
  providers: [PlaybackService, PlaybackRepository],
  exports: [PlaybackService],
})
export class PlaybackModule {}

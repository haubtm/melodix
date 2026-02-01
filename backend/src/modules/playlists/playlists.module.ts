import { Module } from '@nestjs/common';
import { PlaylistController } from './controller/playlist.controller';
import { PlaylistService } from './service/playlist.service';
import { PlaylistRepository } from './repository/playlist.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { SongsModule } from '../songs/songs.module';

@Module({
  imports: [PrismaModule, SongsModule],
  controllers: [PlaylistController],
  providers: [PlaylistService, PlaylistRepository],
  exports: [PlaylistService],
})
export class PlaylistsModule {}

import { Module } from '@nestjs/common';
import { SongService } from './service/song.service';
import { SongController } from './controller/song.controller';
import { SongRepository } from './repository/song.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [PrismaModule, ArtistsModule],
  controllers: [SongController],
  providers: [SongService, SongRepository],
  exports: [SongService],
})
export class SongsModule {}

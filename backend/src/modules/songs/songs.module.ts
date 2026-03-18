import { Module } from '@nestjs/common';
import { SongService } from './service/song.service';
import { SongController } from './controller/song.controller';
import { StreamController } from './controller/stream.controller';
import { SongRepository } from './repository/song.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { ArtistsModule } from '../artists/artists.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, ArtistsModule, UploadModule],
  controllers: [SongController, StreamController],
  providers: [SongService, SongRepository],
  exports: [SongService],
})
export class SongsModule {}

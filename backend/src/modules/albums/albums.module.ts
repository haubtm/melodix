import { Module } from '@nestjs/common';
import { AlbumService } from './service/album.service';
import { AlbumController } from './controller/album.controller';
import { AlbumRepository } from './repository/album.repository';
import { ArtistsModule } from '../artists/artists.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ArtistsModule],
  controllers: [AlbumController],
  providers: [AlbumService, AlbumRepository],
  exports: [AlbumService],
})
export class AlbumsModule {}

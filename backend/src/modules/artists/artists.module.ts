import { Module } from '@nestjs/common';
import { ArtistService } from './service/artist.service';
import { ArtistController } from './controller/artist.controller';
import { ArtistRepository } from './repository/artist.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArtistController],
  providers: [ArtistService, ArtistRepository],
  exports: [ArtistService, ArtistRepository],
})
export class ArtistsModule {}

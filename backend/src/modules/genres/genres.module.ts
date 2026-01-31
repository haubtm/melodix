import { Module } from '@nestjs/common';
import { GenreController } from './controller/genre.controller';
import { GenreService } from './service/genre.service';
import { GenreRepository } from './repository/genre.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GenreController],
  providers: [GenreService, GenreRepository],
  exports: [GenreService, GenreRepository],
})
export class GenresModule {}

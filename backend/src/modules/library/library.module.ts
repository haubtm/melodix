import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SongsModule } from '../songs/songs.module';
import { LibraryController } from './controller/library.controller';
import { LibraryRepository } from './repository/library.repository';
import { LibraryService } from './service/library.service';

@Module({
  imports: [PrismaModule, SongsModule],
  controllers: [LibraryController],
  providers: [LibraryRepository, LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}


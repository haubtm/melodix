import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { toSongResponseDto } from '../../songs/dto';
import { SongService } from '../../songs/service/song.service';
import { LibraryRepository } from '../repository/library.repository';

@Injectable()
export class LibraryService {
  constructor(
    private readonly libraryRepository: LibraryRepository,
    private readonly songService: SongService,
  ) {}

  async getLikedSongs(user: User, page: number = 1, limit: number = 20) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      this.libraryRepository.getLikedSongs(user.id, skip, safeLimit),
      this.libraryRepository.countLikedSongs(user.id),
    ]);

    return new PaginatedResponseDto(
      items.map((song) => toSongResponseDto(song)),
      total,
      safePage,
      safeLimit,
    );
  }

  async likeSong(user: User, songId: number) {
    await this.songService.findOne(songId);
    await this.libraryRepository.addLikedSong(user.id, songId);

    return {
      liked: true,
      songId,
    };
  }

  async unlikeSong(user: User, songId: number) {
    await this.libraryRepository.removeLikedSong(user.id, songId);

    return {
      liked: false,
      songId,
    };
  }

  async getLikedSongStatus(user: User, songId: number) {
    const liked = await this.libraryRepository.isSongLiked(user.id, songId);

    return {
      liked,
      songId,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { toSongResponseDto } from '../../songs/dto';
import { SongService } from '../../songs/service/song.service';
import { RecordPlayDto } from '../dto';
import { PlaybackRepository } from '../repository/playback.repository';

@Injectable()
export class PlaybackService {
  private static readonly PLAY_COUNT_THRESHOLD_MS = 30_000;

  constructor(
    private readonly playbackRepository: PlaybackRepository,
    private readonly songService: SongService,
  ) {}

  async recordPlay(user: User, dto: RecordPlayDto) {
    await this.songService.findOne(dto.songId);

    const shouldIncrementPlayCount =
      (dto.durationMs ?? 0) >= PlaybackService.PLAY_COUNT_THRESHOLD_MS;

    const operations: Array<Promise<unknown>> = [
      this.playbackRepository.createListeningHistory({
        userId: user.id,
        songId: dto.songId,
        durationMs: dto.durationMs,
        contextType: dto.contextType,
        contextId: dto.contextId,
      }),
      this.playbackRepository.upsertRecentlyPlayed({
        userId: user.id,
        songId: dto.songId,
        contextType: dto.contextType,
        contextId: dto.contextId,
      }),
    ];

    if (shouldIncrementPlayCount) {
      operations.unshift(this.playbackRepository.incrementSongPlayCount(dto.songId));
    }

    await Promise.all(operations);

    return {
      message: 'Play recorded successfully',
      counted: shouldIncrementPlayCount,
    };
  }

  async getRecentlyPlayed(user: User, limit: number = 20) {
    const items = await this.playbackRepository.getRecentlyPlayed(user.id, limit);

    return items.map((item) => ({
      playedAt: item.playedAt,
      contextType: item.contextType,
      contextId: item.contextId,
      song: toSongResponseDto(item.song),
    }));
  }
}

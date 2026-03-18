import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { SongService } from '../../songs/service/song.service';
import { RecordPlayDto } from '../dto';
import { PlaybackRepository } from '../repository/playback.repository';

@Injectable()
export class PlaybackService {
  constructor(
    private readonly playbackRepository: PlaybackRepository,
    private readonly songService: SongService,
  ) {}

  async recordPlay(user: User, dto: RecordPlayDto) {
    await this.songService.findOne(dto.songId);

    await Promise.all([
      this.playbackRepository.incrementSongPlayCount(dto.songId),
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
    ]);

    return {
      message: 'Play recorded successfully',
    };
  }

  async getRecentlyPlayed(user: User, limit: number = 20) {
    const items = await this.playbackRepository.getRecentlyPlayed(user.id, limit);

    return items.map((item) => ({
      playedAt: item.playedAt,
      contextType: item.contextType,
      contextId: item.contextId,
      song: item.song,
    }));
  }
}

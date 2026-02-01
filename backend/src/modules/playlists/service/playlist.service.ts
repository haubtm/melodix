import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PlaylistRepository } from '../repository/playlist.repository';
import { CreatePlaylistDto, UpdatePlaylistDto, PlaylistResponseDto, AddSongsDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';
import { SongService } from '../../songs/service/song.service';

@Injectable()
export class PlaylistService {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly songService: SongService,
  ) {}

  async create(userId: number, dto: CreatePlaylistDto): Promise<PlaylistResponseDto> {
    const slug = this.generateSlug(dto.name) + '-' + Date.now(); // Ensure unique slug

    const playlist = await this.playlistRepository.create({
      ...dto,
      slug,
      user: { connect: { id: userId } },
    });

    return new PlaylistResponseDto(playlist);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isPublic: boolean = true,
  ): Promise<PaginatedResponseDto<PlaylistResponseDto>> {
    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.PlaylistWhereInput = { isPublic };
    if (search) {
      where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    }

    const [playlists, total] = await Promise.all([
      this.playlistRepository.findAll({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.playlistRepository.count(where),
    ]);

    return new PaginatedResponseDto(
      playlists.map((pl) => new PlaylistResponseDto(pl)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: number, currentUserId?: number): Promise<any> {
    const playlist = await this.playlistRepository.findById(id);
    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!playlist.isPublic && playlist.userId !== currentUserId) {
      throw new ForbiddenException('This playlist is private');
    }

    return new PlaylistResponseDto(playlist); // Note: Need verify if songs are mapped correctly in DTO
  }

  async update(
    id: number,
    dto: UpdatePlaylistDto,
    currentUserId: number,
  ): Promise<PlaylistResponseDto> {
    const playlist = await this.playlistRepository.findById(id);
    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own playlists');
    }

    const updatedPlaylist = await this.playlistRepository.update(id, dto);
    return new PlaylistResponseDto(updatedPlaylist);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const playlist = await this.playlistRepository.findById(id);
    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own playlists');
    }

    await this.playlistRepository.delete(id);
  }

  async addSongs(id: number, dto: AddSongsDto, currentUserId: number): Promise<void> {
    const playlist = await this.playlistRepository.findById(id);
    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== currentUserId) {
      throw new ForbiddenException('You can only add songs to your own playlists');
    }

    const currentCount = await this.playlistRepository.countSongs(id);
    let nextPosition = currentCount + 1;

    for (const songId of dto.songIds) {
      // Verify song exists
      try {
        // 1. Check if song exists in DB
        await this.songService.findOne(songId);

        // 2. Check if song is already in playlist
        const existing = await this.playlistRepository.count({
          id,
          songs: { some: { songId } },
        } as Prisma.PlaylistWhereInput);

        if (existing > 0) {
          continue; // Already exists
        }

        await this.playlistRepository.addSong({
          playlist: { connect: { id } },
          song: { connect: { id: songId } },
          position: nextPosition++,
          addedBy: currentUserId,
        });
      } catch {
        // Skip invalid songs or duplicates (unique constraint will throw)
        continue;
      }
    }

    // Convert durationMs to number before adding
    // let totalDuration = Number(playlist.durationMs);

    // Update total tracks and duration (simplified, ideally sum from songs)
    const songs = await this.playlistRepository.findById(id);
    if (songs && songs.songs) {
      const trackCount = songs.songs.length;
      // Calculate total duration safely
      const newDuration = songs.songs.reduce(
        (acc, item: any) => acc + (item.song?.durationMs || 0),
        0,
      );

      await this.playlistRepository.update(id, {
        totalTracks: trackCount,
        durationMs: newDuration,
      });
    }
  }

  async removeSong(playlistId: number, songId: number, currentUserId: number): Promise<void> {
    const playlist = await this.playlistRepository.findById(playlistId);
    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== currentUserId) {
      throw new ForbiddenException('You can only remove songs from your own playlists');
    }

    try {
      await this.playlistRepository.removeSong(playlistId, songId);

      // Update counts
      const updatedPlaylist = await this.playlistRepository.findById(playlistId);
      if (updatedPlaylist && updatedPlaylist.songs) {
        // Add check here as well
        const newDuration = updatedPlaylist.songs.reduce(
          (acc, item: any) => acc + (item.song?.durationMs || 0),
          0,
        );
        await this.playlistRepository.update(playlistId, {
          totalTracks: updatedPlaylist.songs.length,
          durationMs: newDuration,
        });
      }
    } catch {
      throw new NotFoundException('Song not found in playlist');
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

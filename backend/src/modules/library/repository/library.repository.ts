import { Injectable } from '@nestjs/common';
import { LibraryItemType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LibraryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLikedSongs(userId: number, skip: number, take: number) {
    const items = await this.prisma.userLibrary.findMany({
      where: {
        userId,
        itemType: LibraryItemType.song,
      },
      orderBy: {
        addedAt: 'desc',
      },
      skip,
      take,
      select: {
        itemId: true,
      },
    });

    if (!items.length) {
      return [];
    }

    const songIds = items.map((item) => item.itemId);
    const songs = await this.prisma.song.findMany({
      where: {
        id: { in: songIds },
      },
      include: {
        album: true,
        primaryArtist: true,
        songArtists: {
          include: {
            artist: true,
          },
        },
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    const songsById = new Map(songs.map((song) => [song.id, song]));
    return songIds
      .map((songId) => songsById.get(songId))
      .filter((song): song is NonNullable<typeof song> => Boolean(song));
  }

  async countLikedSongs(userId: number) {
    return this.prisma.userLibrary.count({
      where: {
        userId,
        itemType: LibraryItemType.song,
      },
    });
  }

  async isSongLiked(userId: number, songId: number) {
    const item = await this.prisma.userLibrary.findFirst({
      where: {
        userId,
        itemType: LibraryItemType.song,
        itemId: songId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(item);
  }

  async addLikedSong(userId: number, songId: number) {
    const existingItem = await this.prisma.userLibrary.findFirst({
      where: {
        userId,
        itemType: LibraryItemType.song,
        itemId: songId,
      },
      select: {
        id: true,
      },
    });

    if (existingItem) {
      return existingItem;
    }

    return this.prisma.userLibrary.create({
      data: {
        user: { connect: { id: userId } },
        itemType: LibraryItemType.song,
        itemId: songId,
      },
    });
  }

  async removeLikedSong(userId: number, songId: number) {
    return this.prisma.userLibrary.deleteMany({
      where: {
        userId,
        itemType: LibraryItemType.song,
        itemId: songId,
      },
    });
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { PlaylistRepository } from '../repository/playlist.repository';
import { SongService } from '../../songs/service/song.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreatePlaylistDto, UpdatePlaylistDto, AddSongsDto } from '../dto';
import { PlaylistEntity } from '../entity/playlist.entity';

describe('PlaylistService', () => {
  let service: PlaylistService;
  let playlistRepository: Record<keyof PlaylistRepository, jest.Mock>;
  let songService: Record<keyof SongService, jest.Mock>;

  beforeEach(async () => {
    playlistRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addSong: jest.fn(),
      removeSong: jest.fn(),
      count: jest.fn(),
      countSongs: jest.fn(),
    };

    songService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistService,
        {
          provide: PlaylistRepository,
          useValue: playlistRepository,
        },
        {
          provide: SongService,
          useValue: songService,
        },
      ],
    }).compile();

    service = module.get<PlaylistService>(PlaylistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a playlist', async () => {
      const dto: CreatePlaylistDto = { name: 'My Playlist' };
      const userId = 1;
      const createdPlaylist: PlaylistEntity = {
        id: 1,
        userId,
        ...dto,
        slug: 'my-playlist',
        isPublic: false,
        isCollaborative: false,
        totalTracks: 0,
        durationMs: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        imageUrl: null,
      };

      playlistRepository.create.mockResolvedValue(createdPlaylist);

      const result = await service.create(userId, dto);
      expect(result).toBeDefined();
      expect(result.name).toEqual(dto.name);
      expect(playlistRepository.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated playlists', async () => {
      const playlists: PlaylistEntity[] = [
        {
          id: 1,
          userId: 1,
          name: 'Public Playlist',
          slug: 'public-playlist',
          isPublic: true,
          isCollaborative: false,
          totalTracks: 0,
          durationMs: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
          imageUrl: null,
        },
      ];
      playlistRepository.findAll.mockResolvedValue(playlists);
      playlistRepository.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a public playlist', async () => {
      const playlist = {
        id: 1,
        userId: 2,
        isPublic: true,
        name: 'Public',
      } as PlaylistEntity;
      playlistRepository.findById.mockResolvedValue(playlist);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should return a private playlist if owner', async () => {
      const playlist = {
        id: 1,
        userId: 1,
        isPublic: false,
        name: 'Private',
      } as PlaylistEntity;
      playlistRepository.findById.mockResolvedValue(playlist);

      const result = await service.findOne(1, 1);
      expect(result.id).toBe(1);
    });

    it('should throw ForbiddenException if private and not owner', async () => {
      const playlist = {
        id: 1,
        userId: 2,
        isPublic: false,
        name: 'Private',
      } as PlaylistEntity;
      playlistRepository.findById.mockResolvedValue(playlist);

      await expect(service.findOne(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if not found', async () => {
      playlistRepository.findById.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update playlist if owner', async () => {
      const playlist = { id: 1, userId: 1, name: 'Old' } as PlaylistEntity;
      playlistRepository.findById.mockResolvedValue(playlist);
      playlistRepository.update.mockResolvedValue({
        ...playlist,
        name: 'New',
      });

      const dto: UpdatePlaylistDto = { name: 'New' };
      const result = await service.update(1, dto, 1);
      expect(result.name).toBe('New');
    });

    it('should throw ForbiddenException if not owner', async () => {
      const playlist = { id: 1, userId: 2, name: 'Old' } as PlaylistEntity;
      playlistRepository.findById.mockResolvedValue(playlist);

      const dto: UpdatePlaylistDto = { name: 'New' };
      await expect(service.update(1, dto, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete playlist if owner', async () => {
      const playlist = { id: 1, userId: 1 } as PlaylistEntity;
      playlistRepository.findById.mockResolvedValue(playlist);
      playlistRepository.delete.mockResolvedValue(playlist);

      await service.remove(1, 1);
      expect(playlistRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('addSongs', () => {
    it('should add songs to playlist', async () => {
      const playlist = { id: 1, userId: 1, durationMs: 0 } as PlaylistEntity;
      playlistRepository.findById.mockResolvedValueOnce(playlist); // initial check
      playlistRepository.countSongs.mockResolvedValue(0);
      playlistRepository.count.mockResolvedValue(0); // Mock duplicate check
      songService.findOne.mockResolvedValue({ id: 1, durationMs: 3000 });
      playlistRepository.addSong.mockResolvedValue({});

      // Mock findById for duration update
      playlistRepository.findById.mockResolvedValueOnce({
        ...playlist,
        songs: [{ song: { durationMs: 3000 } }],
      } as any);

      const dto: AddSongsDto = { songIds: [1] };
      await service.addSongs(1, dto, 1);

      expect(playlistRepository.addSong).toHaveBeenCalled();
      expect(playlistRepository.update).toHaveBeenCalled();
    });
  });
});

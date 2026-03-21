import { Injectable } from '@nestjs/common';
import { AlbumService } from '../../albums/service/album.service';
import { ArtistService } from '../../artists/service/artist.service';
import { PlaylistService } from '../../playlists/service/playlist.service';
import { SongService } from '../../songs/service/song.service';
import { SearchQueryDto, SearchResponseDto } from '../dto';
import { SongListDto } from '../../songs/dto/song-list.dto';
import { ArtistListDto } from '../../artists/dto/artist-list.dto';
import { AlbumListDto } from '../../albums/dto/album-list.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly songService: SongService,
    private readonly artistService: ArtistService,
    private readonly albumService: AlbumService,
    private readonly playlistService: PlaylistService,
  ) {}

  async search(queryDto: SearchQueryDto): Promise<SearchResponseDto> {
    const query = queryDto.q?.trim();

    if (!query) {
      return {
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
      };
    }

    const songListDto = new SongListDto();
    songListDto.page = 1;
    songListDto.limit = queryDto.songsLimit || 8;
    songListDto.search = {
      fields: ['title'],
      data: query,
    };

    const artistListDto = new ArtistListDto();
    artistListDto.page = 1;
    artistListDto.limit = queryDto.artistsLimit || 6;
    artistListDto.search = {
      fields: ['name', 'slug', 'bio'],
      data: query,
    };

    const albumListDto = new AlbumListDto();
    albumListDto.page = 1;
    albumListDto.limit = queryDto.albumsLimit || 6;
    albumListDto.search = {
      fields: ['title', 'description'],
      data: query,
    } as never;

    const [songsResult, artistsResult, albumsResult, playlistsResult] =
      await Promise.all([
        this.songService.findAll(songListDto),
        this.artistService.findAll(artistListDto),
        this.albumService.findAll(albumListDto),
        this.playlistService.findAll(1, queryDto.playlistsLimit || 6, query),
      ]);

    return {
      songs: songsResult.data,
      artists: artistsResult.data,
      albums: albumsResult.data,
      playlists: playlistsResult.data,
    };
  }
}

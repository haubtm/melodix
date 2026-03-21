import { Module } from '@nestjs/common';
import { AlbumsModule } from '../albums/albums.module';
import { ArtistsModule } from '../artists/artists.module';
import { PlaylistsModule } from '../playlists/playlists.module';
import { SongsModule } from '../songs/songs.module';
import { SearchController } from './controller/search.controller';
import { SearchService } from './service/search.service';

@Module({
  imports: [SongsModule, ArtistsModule, AlbumsModule, PlaylistsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorator/public.decorator';
import { SearchQueryDto, SearchResponseDto } from '../dto';
import { SearchService } from '../service/search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search songs, artists, albums, and playlists' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'songsLimit', required: false, type: Number })
  @ApiQuery({ name: 'artistsLimit', required: false, type: Number })
  @ApiQuery({ name: 'albumsLimit', required: false, type: Number })
  @ApiQuery({ name: 'playlistsLimit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Search results grouped by entity type',
    type: SearchResponseDto,
  })
  search(@Query() queryDto: SearchQueryDto) {
    return this.searchService.search(queryDto);
  }
}

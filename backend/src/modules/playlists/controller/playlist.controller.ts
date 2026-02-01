import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PlaylistService } from '../service/playlist.service';
import { CreatePlaylistDto, UpdatePlaylistDto, PlaylistResponseDto, AddSongsDto } from '../dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { GetUser } from '../../auth/decorator/get-user.decorator';
import { Public } from '../../../common/decorator/public.decorator';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new playlist' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Playlist created successfully',
    type: PlaylistResponseDto,
  })
  create(@Body() createPlaylistDto: CreatePlaylistDto, @GetUser('id') userId: number) {
    return this.playlistService.create(userId, createPlaylistDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get public playlists' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return list of public playlists',
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.playlistService.findAll(Number(page), Number(limit), search);
  }

  @Get(':id')
  @Public()
  @UseGuards(JwtAuthGuard) // Use guard but allow public access logic in service
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get playlist details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return playlist details',
    type: PlaylistResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser('id') currentUserId?: number) {
    return this.playlistService.findOne(id, currentUserId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update playlist (Owner only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Playlist updated successfully',
    type: PlaylistResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @GetUser('id') currentUserId: number,
  ) {
    return this.playlistService.update(id, updatePlaylistDto, currentUserId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete playlist (Owner only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Playlist deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser('id') currentUserId: number) {
    return this.playlistService.remove(id, currentUserId);
  }

  @Post(':id/songs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add songs to playlist (Owner only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Songs added successfully',
  })
  addSongs(
    @Param('id', ParseIntPipe) id: number,
    @Body() addSongsDto: AddSongsDto,
    @GetUser('id') currentUserId: number,
  ) {
    return this.playlistService.addSongs(id, addSongsDto, currentUserId);
  }

  @Delete(':id/songs/:songId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove song from playlist (Owner only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Song removed successfully',
  })
  removeSong(
    @Param('id', ParseIntPipe) id: number,
    @Param('songId', ParseIntPipe) songId: number,
    @GetUser('id') currentUserId: number,
  ) {
    return this.playlistService.removeSong(id, songId, currentUserId);
  }
}

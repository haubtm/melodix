import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { LibraryService } from '../service/library.service';

@ApiTags('library')
@Controller('library')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('songs')
  @ApiOperation({ summary: 'Get liked songs for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getLikedSongs(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.libraryService.getLikedSongs(user, Number(page), Number(limit));
  }

  @Get('songs/:songId/status')
  @ApiOperation({ summary: 'Check whether a song is liked by current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Like status returned' })
  getLikedSongStatus(@CurrentUser() user: User, @Param('songId', ParseIntPipe) songId: number) {
    return this.libraryService.getLikedSongStatus(user, songId);
  }

  @Post('songs/:songId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a song' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Song liked successfully' })
  likeSong(@CurrentUser() user: User, @Param('songId', ParseIntPipe) songId: number) {
    return this.libraryService.likeSong(user, songId);
  }

  @Delete('songs/:songId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a song' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Song removed from liked songs' })
  unlikeSong(@CurrentUser() user: User, @Param('songId', ParseIntPipe) songId: number) {
    return this.libraryService.unlikeSong(user, songId);
  }
}


import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SongService } from '../service/song.service';
import { CreateSongDto } from '../dto/create-song.dto';
import { UpdateSongDto } from '../dto/update-song.dto';
import { RejectSongDto } from '../dto/reject-song.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guard/optional-jwt-auth.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { UserRole, SongStatus } from '@prisma/client';
import { Public } from '../../../common/decorator/public.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';

@ApiTags('songs')
@Controller('songs')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.admin, UserRole.artist)
  @ApiOperation({ summary: 'Create a new song (Artist: pending, Admin: approved)' })
  create(@Body() createSongDto: CreateSongDto, @CurrentUser() user: any) {
    return this.songService.create(createSongDto, user);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all songs with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'artistId', required: false, type: Number })
  @ApiQuery({ name: 'albumId', required: false, type: Number })
  @ApiQuery({ name: 'genreId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SongStatus,
    description: 'Filter by status (Admin only)',
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('artistId') artistId?: number,
    @Query('albumId') albumId?: number,
    @Query('genreId') genreId?: number,
    @Query('status') status?: SongStatus,
    @CurrentUser() user?: any,
  ) {
    return this.songService.findAll(
      Number(page),
      Number(limit),
      search,
      artistId ? Number(artistId) : undefined,
      albumId ? Number(albumId) : undefined,
      genreId ? Number(genreId) : undefined,
      status,
      user,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.artist, UserRole.admin)
  @ApiOperation({ summary: 'Get my songs (Artist only - all statuses)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findMySongs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: any,
  ) {
    return this.songService.findMySongs(user, Number(page), Number(limit));
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get pending songs (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findPending(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.songService.findPending(Number(page), Number(limit));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a song by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.songService.findOne(id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Approve a song (Admin only)' })
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.songService.approve(id, user);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Reject a song (Admin only)' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectSongDto: RejectSongDto,
    @CurrentUser() user: any,
  ) {
    return this.songService.reject(id, rejectSongDto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.admin, UserRole.artist)
  @ApiOperation({ summary: 'Update a song' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSongDto: UpdateSongDto,
    @CurrentUser() user: any,
  ) {
    return this.songService.update(id, updateSongDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Delete a song' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.songService.remove(id, user);
  }
}

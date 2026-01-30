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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { UserRole } from '@prisma/client';
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
  @ApiOperation({ summary: 'Create a new song' })
  create(@Body() createSongDto: CreateSongDto, @CurrentUser() user: any) {
    return this.songService.create(createSongDto, user);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all songs with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'artistId', required: false, type: Number })
  @ApiQuery({ name: 'albumId', required: false, type: Number })
  @ApiQuery({ name: 'genreId', required: false, type: Number })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('artistId') artistId?: number,
    @Query('albumId') albumId?: number,
    @Query('genreId') genreId?: number,
  ) {
    return this.songService.findAll(
      Number(page),
      Number(limit),
      search,
      artistId ? Number(artistId) : undefined,
      albumId ? Number(albumId) : undefined,
      genreId ? Number(genreId) : undefined,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a song by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.songService.findOne(id);
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

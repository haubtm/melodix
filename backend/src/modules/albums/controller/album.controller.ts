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
  HttpStatus,
} from '@nestjs/common';
import { AlbumService } from '../service/album.service';
import { CreateAlbumDto, UpdateAlbumDto, AlbumResponseDto } from '../dto';
import { DeleteManyDto } from '../../../common/dto/delete-many.dto';
import { AlbumListDto } from '../dto/album-list.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from '../../auth/decorator';
import { Public } from '../../../common/decorator/public.decorator';

@ApiTags('albums')
@Controller('albums')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.artist)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new album (Admin or Artist)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Album created successfully',
    type: AlbumResponseDto,
  })
  create(
    @Body() createAlbumDto: CreateAlbumDto,
    @GetUser('id') currentUserId: number,
    @GetUser('role') currentUserRole: UserRole,
  ) {
    return this.albumService.create(createAlbumDto, currentUserId, currentUserRole);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all albums' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return list of albums',
  })
  findAll(@Query() listDto: AlbumListDto) {
    return this.albumService.findAll(listDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get album by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return album details',
    type: AlbumResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.albumService.findOne(id);
  }

  @Delete('many')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.artist)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete multiple albums (Admin or Owner)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Albums deleted successfully',
  })
  removeMany(
    @Body() deleteManyDto: DeleteManyDto,
    @GetUser('id') currentUserId: number,
    @GetUser('role') currentUserRole: UserRole,
  ) {
    return this.albumService.deleteMany(deleteManyDto, currentUserId, currentUserRole);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.artist)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update album (Admin or Owner)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Album updated successfully',
    type: AlbumResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlbumDto: UpdateAlbumDto,
    @GetUser('id') currentUserId: number,
    @GetUser('role') currentUserRole: UserRole,
  ) {
    return this.albumService.update(id, updateAlbumDto, currentUserId, currentUserRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.artist)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete album (Admin or Owner)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Album deleted successfully',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') currentUserId: number,
    @GetUser('role') currentUserRole: UserRole,
  ) {
    return this.albumService.remove(id, currentUserId, currentUserRole);
  }
}

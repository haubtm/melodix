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
  HttpCode,
} from '@nestjs/common';
import { ArtistService } from '../service/artist.service';
import { CreateArtistDto, UpdateArtistDto, ArtistResponseDto, ArtistListDto } from '../dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteManyDto } from '../../../common/dto';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from '../../auth/decorator';

@ApiTags('artists')
@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new artist (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Artist created successfully',
    type: ArtistResponseDto,
  })
  create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistService.create(createArtistDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all artists with advanced filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return list of artists',
  })
  findAll(@Body() listDto: ArtistListDto) {
    return this.artistService.findAll(listDto);
  }

  @Delete('many')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete many artists' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Artists deleted successfully',
  })
  removeMany(@Body() deleteManyDto: DeleteManyDto) {
    return this.artistService.removeMany(deleteManyDto.ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artist by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return artist details',
    type: ArtistResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.artistService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.artist)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update artist (Admin or Artist)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Artist updated successfully',
    type: ArtistResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArtistDto: UpdateArtistDto,
    @GetUser('id') currentUserId: number,
    @GetUser('role') currentUserRole: UserRole,
  ) {
    return this.artistService.update(id, updateArtistDto, currentUserId, currentUserRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.artist)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete artist (Admin or Owner)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Artist deleted successfully',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') currentUserId: number,
    @GetUser('role') currentUserRole: UserRole,
  ) {
    return this.artistService.remove(id, currentUserId, currentUserRole);
  }
}

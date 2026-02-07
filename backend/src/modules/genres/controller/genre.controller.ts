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
import { GenreService } from '../service/genre.service';
import { CreateGenreDto, UpdateGenreDto, GenreResponseDto, GenreListDto } from '../dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteManyDto } from '../../../common/dto/delete-many.dto';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('genres')
@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new genre (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Genre created successfully',
    type: GenreResponseDto,
  })
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genreService.create(createGenreDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all genres with filter/search' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return list of genres',
  })
  findAll(@Body() listDto: GenreListDto) {
    return this.genreService.findAll(listDto);
  }

  @Post('list-using-select')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get simplified genre list for select inputs with filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return paginated list of genres (id, name)',
  })
  getListUsingSelect(@Body() listDto: GenreListDto) {
    return this.genreService.getListUsingSelect(listDto);
  }

  @Delete('many')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete multiple genres (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Genres deleted successfully',
  })
  removeMany(@Body() deleteManyDto: DeleteManyDto) {
    return this.genreService.deleteMany(deleteManyDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get genre by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return genre details',
    type: GenreResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Genre not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update genre (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Genre updated successfully',
    type: GenreResponseDto,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genreService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete genre (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Genre deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.remove(id);
  }
}

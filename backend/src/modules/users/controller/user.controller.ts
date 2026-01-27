import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from '../service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserListDto, DeleteManyDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiResponse({
    status: 201,
    description: 'User đã được tạo',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email hoặc username đã tồn tại' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách users với search, filter, sort' })
  @ApiResponse({ status: 200, description: 'Danh sách users' })
  async findAll(@Body() listDto: UserListDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.userService.findAll(listDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin user theo ID' })
  @ApiParam({ name: 'id', description: 'User ID (Int)' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin user',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin user' })
  @ApiParam({ name: 'id', description: 'User ID (Int)' })
  @ApiResponse({
    status: 200,
    description: 'User đã được cập nhật',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('many')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa nhiều users (soft delete)' })
  @ApiResponse({ status: 200, description: 'Các users đã được xóa' })
  async removeMany(@Body() deleteManyDto: DeleteManyDto): Promise<void> {
    return this.userService.removeMany(deleteManyDto.ids);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa user (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID (Int)' })
  @ApiResponse({ status: 200, description: 'User đã được xóa' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}

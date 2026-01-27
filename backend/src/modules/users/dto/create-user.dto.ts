import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email của user' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'johndoe', description: 'Username duy nhất' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Tên hiển thị' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({
    example: '1990-01-15',
    description: 'Ngày sinh (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'user',
    enum: UserRole,
    description: 'Vai trò người dùng (user, artist, admin)',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'VN', description: 'Mã quốc gia' })
  @IsOptional()
  @IsString()
  country?: string;
}

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserListDto } from '../dto';
import { USER_ERRORS, USER_DEFAULTS } from '../constant';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email or username already exists
    const existingUser = await this.userRepository.findByEmailOrUsername(
      createUserDto.email,
      createUserDto.username,
    );

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException(USER_ERRORS.EMAIL_EXISTS);
      }
      throw new ConflictException(USER_ERRORS.USERNAME_EXISTS);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      USER_DEFAULTS.PASSWORD_SALT_ROUNDS,
    );

    // Create user
    const user = await this.userRepository.create({
      email: createUserDto.email,
      passwordHash,
      username: createUserDto.username,
      displayName: createUserDto.displayName,
      dateOfBirth: createUserDto.dateOfBirth ? new Date(createUserDto.dateOfBirth) : null,
      country: createUserDto.country,
    });

    return new UserResponseDto(user);
  }

  async findAll(listDto: UserListDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    const page = listDto.page || 1;
    const limit = Math.min(listDto.limit || USER_DEFAULTS.PAGE_SIZE, USER_DEFAULTS.MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    // isActive filter
    if (listDto.isActive !== undefined) {
      where.isActive = listDto.isActive;
    } else {
      where.isActive = true; // Default: only active users
    }

    // isArtist filter
    if (listDto.isArtist !== undefined) {
      where.isArtist = listDto.isArtist;
    }

    // subscriptionType filter
    if (listDto.subscriptionType) {
      where.subscriptionType = listDto.subscriptionType as any;
    }

    // Search filter
    const VALID_SEARCH_FIELDS = ['email', 'username', 'displayName'];
    if (listDto.search?.data && listDto.search.fields?.length) {
      const searchConditions = listDto.search.fields
        .filter((field: string) => VALID_SEARCH_FIELDS.includes(field))
        .map((field: string) => ({
          [field]: { contains: listDto.search!.data },
        }));

      if (searchConditions.length > 0) {
        where.OR = searchConditions;
      }
    }

    // Build orderBy
    let orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] = {
      createdAt: 'desc',
    };

    if (listDto.sorts?.length) {
      orderBy = listDto.sorts.map((sort) => ({
        [sort.field || 'createdAt']: sort.order?.toLowerCase() || 'desc',
      }));
    }

    const [users, total] = await Promise.all([
      this.userRepository.findAll({ where, skip, take: limit, orderBy }),
      this.userRepository.count(where),
    ]);

    const data = users.map((user) => new UserResponseDto(user));
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findActiveById(id);

    if (!user) {
      throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
    }

    return new UserResponseDto(user);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string) {
    return this.userRepository.findByUsername(username);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findActiveById(id);

    if (!existingUser) {
      throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
    }

    const user = await this.userRepository.update(id, {
      displayName: updateUserDto.displayName,
      avatarUrl: updateUserDto.avatarUrl,
      dateOfBirth: updateUserDto.dateOfBirth ? new Date(updateUserDto.dateOfBirth) : undefined,
      country: updateUserDto.country,
    });

    return new UserResponseDto(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
    }

    await this.userRepository.softDelete(id);
  }

  async removeMany(ids: number[]): Promise<void> {
    const users = await this.userRepository.findAll({
      where: {
        id: { in: ids },
        isActive: true,
      },
    });

    const foundIds = users.map((user) => user.id);
    const missingIds = ids.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(`Users with IDs [${missingIds.join(', ')}] not found`);
    }

    await this.userRepository.softDeleteMany(ids);
  }

  async validatePassword(email: string, password: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return null;
    }

    if (!user.isActive) {
      throw new ConflictException(USER_ERRORS.ACCOUNT_DISABLED);
    }

    return new UserResponseDto(user);
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, USER_DEFAULTS.PASSWORD_SALT_ROUNDS);
    await this.userRepository.updatePassword(id, passwordHash);
  }

  async verifyEmail(id: number): Promise<void> {
    await this.userRepository.verifyEmail(id);
  }
}

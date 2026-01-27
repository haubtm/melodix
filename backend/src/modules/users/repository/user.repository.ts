import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserEntity } from '../entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<UserEntity> {
    return this.prisma.user.create({ data });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findByEmailOrUsername(email: string, username: string): Promise<UserEntity | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
  }): Promise<UserEntity[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<UserEntity> {
    return this.prisma.user.delete({ where: { id } });
  }

  async softDelete(id: number): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async softDeleteMany(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.prisma.user.updateMany({
      where: {
        id: { in: ids },
      },
      data: { isActive: false },
    });
  }

  async findActiveById(id: number): Promise<UserEntity | null> {
    return this.prisma.user.findFirst({
      where: { id, isActive: true },
    });
  }

  async updatePassword(id: number, passwordHash: string): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async verifyEmail(id: number): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    });
  }
}

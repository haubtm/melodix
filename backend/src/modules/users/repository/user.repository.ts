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

  // OAuth Methods
  async findByOAuthProvider(provider: string, providerId: string) {
    return this.prisma.userOAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: providerId,
        },
      },
      include: { user: true },
    });
  }

  async createOAuthAccount(
    userId: number,
    data: {
      provider: string;
      providerUserId: string;
      email?: string | null;
      name?: string | null;
      avatarUrl?: string | null;
      accessToken?: string | null;
      refreshToken?: string | null;
    },
  ) {
    return this.prisma.userOAuthAccount.create({
      data: {
        userId,
        provider: data.provider,
        providerUserId: data.providerUserId,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    });
  }

  async findOrCreateOAuthUser(oauthData: {
    provider: string;
    providerId: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<UserEntity> {
    // 1. Check if OAuth account exists
    const existingOAuth = await this.findByOAuthProvider(oauthData.provider, oauthData.providerId);

    if (existingOAuth) {
      // Update tokens if changed
      await this.prisma.userOAuthAccount.update({
        where: { id: existingOAuth.id },
        data: {
          accessToken: oauthData.accessToken,
          refreshToken: oauthData.refreshToken,
        },
      });
      return existingOAuth.user;
    }

    // 2. Check if user with same email exists
    if (oauthData.email) {
      const existingUser = await this.findByEmail(oauthData.email);
      if (existingUser) {
        // Link OAuth account to existing user
        await this.createOAuthAccount(existingUser.id, {
          provider: oauthData.provider,
          providerUserId: oauthData.providerId,
          email: oauthData.email,
          name: oauthData.displayName,
          avatarUrl: oauthData.avatarUrl,
          accessToken: oauthData.accessToken,
          refreshToken: oauthData.refreshToken,
        });
        return existingUser;
      }
    }

    // 3. Create new user with OAuth account
    const username = this.generateUsername(oauthData.displayName, oauthData.providerId);
    const newUser = await this.prisma.user.create({
      data: {
        email: oauthData.email || `${oauthData.providerId}@${oauthData.provider}.oauth`,
        username,
        displayName: oauthData.displayName,
        avatarUrl: oauthData.avatarUrl,
        emailVerified: !!oauthData.email,
        passwordHash: null, // OAuth users don't have password
        oauthAccounts: {
          create: {
            provider: oauthData.provider,
            providerUserId: oauthData.providerId,
            email: oauthData.email,
            name: oauthData.displayName,
            avatarUrl: oauthData.avatarUrl,
            accessToken: oauthData.accessToken,
            refreshToken: oauthData.refreshToken,
          },
        },
      },
    });

    return newUser;
  }

  private generateUsername(displayName: string | null, providerId: string): string {
    if (displayName) {
      const base = displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 15);
      return `${base}_${providerId.slice(-4)}`;
    }
    return `user_${providerId.slice(-8)}`;
  }
}

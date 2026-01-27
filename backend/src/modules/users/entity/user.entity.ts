import { User } from '@prisma/client';

export type UserEntity = User;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserWithoutPassword extends Omit<User, 'passwordHash'> {}

export interface IUserPublicProfile {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isArtist: boolean;
}

export interface IUserSession {
  userId: number;
  email: string;
  username: string;
  subscriptionType: string;
}

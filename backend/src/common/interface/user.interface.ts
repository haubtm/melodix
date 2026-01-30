import { UserRole } from '@prisma/client';

export interface UserPayload {
  sub: number; // User ID
  email: string;
  role: UserRole;
  // Add other claims if needed, e.g. iat, exp
  id?: number; // Alias for sub, depends on how guard attaches it
}

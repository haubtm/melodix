import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  handleRequest<TUser = any>(
    err: Error,
    user: TUser,
    _info: any,
    _context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err;
    }
    return user;
  }
}

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  handleRequest<TUser = any>(
    err: Error,
    user: TUser,
    _info: any,
    _context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      // Let the controller handle the error or redirect
      throw err;
    }
    return user;
  }
}

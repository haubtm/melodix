import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard cho phép request không có token vẫn đi qua,
 * nhưng nếu có token hợp lệ thì sẽ inject user vào request.
 * Dùng cho các endpoint "public nhưng cần biết user nếu có".
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Call the parent's canActivate to attempt authentication
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Don't throw error if no user (allow anonymous access)
    // Just return null/undefined if authentication fails
    return user || null;
  }
}

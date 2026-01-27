import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      let message = 'Vui lòng đăng nhập để tiếp tục';
      if (info) {
        if (info.name === 'TokenExpiredError') {
          message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
        } else if (info.name === 'JsonWebTokenError') {
          message = 'Token không hợp lệ';
        } else if (info.message === 'No auth token') {
          message = 'Không tìm thấy token xác thực';
        } else {
          message = info.message || message;
        }
      }
      throw err || new UnauthorizedException(message);
    }
    return user;
  }
}

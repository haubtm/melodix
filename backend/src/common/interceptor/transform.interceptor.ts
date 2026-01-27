import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;

        let responseData = data;
        let metadata = undefined;
        let message = 'Thành công';

        // Check if data is PaginatedResponseDto
        if (data instanceof PaginatedResponseDto) {
          responseData = data.data;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { data: _, ...meta } = data;
          metadata = meta;
        } else if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          Object.keys(data).length === 1
        ) {
          // Case where service returns { message: "..." }
          message = data.message;
          responseData = null;
        } else if (data && typeof data === 'object' && 'message' in data) {
          // Case where service returns { message: "...", ...otherData }
          message = data.message;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { message: _, ...rest } = data;
          responseData = rest;
          if (Object.keys(responseData).length === 0) responseData = null;
        }

        if (responseData === undefined) responseData = null;

        return {
          code: 1, // Default success code
          status: statusCode,
          message: message,
          data: responseData,
          metadata: metadata,
        };
      }),
    );
  }
}

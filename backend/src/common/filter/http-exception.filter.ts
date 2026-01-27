import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let errors = null;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resData = exceptionResponse as any;
      if (resData.message) {
        message = Array.isArray(resData.message)
          ? resData.message[0]
          : resData.message;
      }
      if (resData.error) {
        // Optional: include detailed error info if needed
      }
    }

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Message: ${message}`,
    );

    const apiResponse = new ApiResponseDto<null>(
      0, // Error code (can be customized)
      status,
      message,
      null,
      {
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    );

    response.status(status).json(apiResponse);
  }
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP_ERROR');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error).message, statusCode: status };

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: typeof message === 'string' ? message : (message as any).message || message,
    };

    // Logging the error for production monitoring
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status} - ${JSON.stringify(errorResponse.error)}`,
        (exception as Error).stack,
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - ${status} - ${JSON.stringify(errorResponse.error)}`);
    }

    response.status(status).json(errorResponse);
  }
}

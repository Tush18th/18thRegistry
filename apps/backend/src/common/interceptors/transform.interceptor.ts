import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta: any;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly logger = new Logger('HTTP_RESPONSE');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        this.logger.log(`[${request.method}] ${request.url} - Success`);
        return {
          data,
          meta: {
            requestPath: request.url,
            count: Array.isArray(data) ? data.length : 1,
          },
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

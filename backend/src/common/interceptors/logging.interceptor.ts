import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

/** Interceptor that logs every HTTP request with its method, URL, and response time in milliseconds. */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  /** Wraps the request handler to measure and log the response time. */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req    = context.switchToHttp().getRequest<Request>();
    const method = req.method;
    const url    = req.url;
    const start  = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`${method} ${url} → ${ms}ms`);
      }),
    );
  }
}

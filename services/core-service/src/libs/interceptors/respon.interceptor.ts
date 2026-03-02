import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SuccessResponse<T> {
  status: 'success' | 'error';
  statusCode: number;
  path: string;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<SuccessResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data: any) => {
        const message =
          data && typeof data === 'object' && 'message' in data
            ? data.message
            : 'success';

        const responseData =
          data && typeof data === 'object' && 'data' in data
            ? data.data
            : data;

        const statusCode = response.statusCode;

        return {
          status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
          statusCode,
          path: request.url,
          message,
          data: responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
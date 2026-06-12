import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  extractRequestId(request: Request): string | undefined {
    return (
      (request.headers['x-request-id'] as string | undefined) ||
      (request.headers['x-correlation-id'] as string | undefined)
    );
  }

  use(request: Request, response: Response, next: NextFunction) {
    const existingId = this.extractRequestId(request);
    const requestId = existingId || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    request.headers['x-request-id'] = requestId;
    response.setHeader('X-Request-Id', requestId);
    next();
  }
}

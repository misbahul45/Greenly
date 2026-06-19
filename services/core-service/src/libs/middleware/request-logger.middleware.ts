import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { sanitizeForLog, stringifyForLog } from '../utils/log-sanitizer';

type RequestWithContext = Request & {
  requestId?: string;
  user?: { id?: string; sub?: string; shopId?: string };
};

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: RequestWithContext, res: Response, next: NextFunction): void {
    const startedAt = Date.now();
    const requestId =
      req.headers['x-request-id']?.toString() ||
      req.headers['x-correlation-id']?.toString() ||
      randomUUID();

    req.requestId = requestId;
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    const baseLog = {
      requestId,
      serviceName: 'core-service',
      method: req.method,
      path: req.originalUrl || req.url,
      query: sanitizeForLog(req.query),
      params: sanitizeForLog(req.params),
      body: sanitizeForLog(req.body),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`[HTTP IN] ${stringifyForLog(baseLog)}`);

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const routePath =
        req.route?.path && typeof req.route.path === 'string'
          ? req.route.path
          : undefined;
      const outLog = {
        ...baseLog,
        routeParams: sanitizeForLog(req.params),
        statusCode: res.statusCode,
        durationMs,
        actionName: routePath,
        userId: req.user?.id || req.user?.sub,
        shopId: req.params?.shopId || req.body?.shopId || req.user?.shopId,
        timestamp: new Date().toISOString(),
      };

      const message = `[HTTP OUT] ${stringifyForLog(outLog)}`;
      if (res.statusCode >= 500) {
        this.logger.error(message);
      } else if (res.statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}

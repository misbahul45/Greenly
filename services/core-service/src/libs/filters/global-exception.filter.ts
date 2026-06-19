import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '../../../generated/prisma/client';
import { AppError } from '../errors/app.error';
import { sanitizeForLog, stringifyForLog } from '../utils/log-sanitizer';

interface HttpExceptionResponse {
  message?: string | string[];
  errors?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal Server Error';
    let errors: unknown = null;
    let prismaCode: string | undefined;
    let cause: unknown;

    if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
      errors = exception.errors ?? null;
      cause = exception.cause;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse =
        exception.getResponse() as HttpExceptionResponse | string;

      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse?.message?.toString() ?? exception.message;

      errors =
        typeof exceptionResponse === 'object'
          ? exceptionResponse.errors ?? null
          : null;
      cause = exception.cause;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = this.mapPrismaStatus(exception.code);
      message = this.mapPrismaMessage(exception.code);
      prismaCode = exception.code;
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid database query';
    }

    const requestId =
      request.requestId ||
      request.headers['x-request-id']?.toString() ||
      request.headers['x-correlation-id']?.toString();

    this.logger.error(
      stringifyForLog({
        requestId,
        serviceName: 'core-service',
        method: request.method,
        path: request.originalUrl || request.url,
        statusCode: status,
        errorName:
          exception && typeof exception === 'object'
            ? exception.constructor?.name
            : typeof exception,
        message:
          exception instanceof Error ? exception.message : String(exception),
        responseMessage: message,
        prismaCode,
        validationErrors: status === HttpStatus.BAD_REQUEST ? errors : null,
        cause: this.serializeCause(cause),
        timestamp: new Date().toISOString(),
      }),
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(status).json({
      status: false,
      statusCode: status,
      path: request.originalUrl || request.url,
      message,
      errors: sanitizeForLog(errors),
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  private mapPrismaStatus(code: string): number {
    switch (code) {
      case 'P2002':
      case 'P2003':
        return HttpStatus.CONFLICT;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private mapPrismaMessage(code: string): string {
    switch (code) {
      case 'P2002':
        return 'Resource already exists';
      case 'P2003':
        return 'Related resource constraint failed';
      case 'P2025':
        return 'Resource not found';
      default:
        return 'Database request failed';
    }
  }

  private serializeCause(cause: unknown): unknown {
    if (!cause) {
      return null;
    }

    if (cause instanceof Error) {
      return {
        name: cause.name,
        message: cause.message,
        stack: cause.stack,
      };
    }

    return cause;
  }
}

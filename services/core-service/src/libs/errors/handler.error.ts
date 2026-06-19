import { HttpException, Logger } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { AppError } from './app.error';

const logger = new Logger('ErrorHandler');

function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      return new AppError('Resource already exists', 409, { cause: error });
    case 'P2003':
      return new AppError('Related resource constraint failed', 409, {
        cause: error,
      });
    case 'P2025':
      return new AppError('Resource not found', 404, { cause: error });
    default:
      return new AppError('Database request failed', 500, { cause: error });
  }
}

export default async function ErrorHandler<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.error(
      `[ERROR_HANDLER] ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error.stack : undefined
    );

    if (error instanceof AppError || error instanceof HttpException) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw mapPrismaError(error);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new AppError('Invalid database query', 400, { cause: error });
    }

    throw new AppError('Internal server error', 500, {
      cause: error,
    });
  }
}

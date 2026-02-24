import { AppError } from './app.error';

export default async function ErrorHandler<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
     console.error('REAL ERROR:', error);
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'Internal server error',
      500,
      false
    );
  }
}
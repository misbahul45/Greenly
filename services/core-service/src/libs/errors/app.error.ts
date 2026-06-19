export class AppError extends Error {
  public readonly cause?: unknown;
  public readonly errors?: unknown;

  constructor(
    public message: string,
    public statusCode: number = 500,
    options?: unknown
  ) {
    const errorOptions =
      options &&
      typeof options === 'object' &&
      'cause' in (options as Record<string, unknown>)
        ? { cause: (options as { cause?: unknown }).cause }
        : undefined;

    super(message, errorOptions);
    this.name = 'AppError';

    if (
      options &&
      typeof options === 'object' &&
      ('cause' in (options as Record<string, unknown>) ||
        'errors' in (options as Record<string, unknown>))
    ) {
      this.cause = (options as { cause?: unknown }).cause;
      this.errors = (options as { errors?: unknown }).errors ?? null;
    } else {
      this.errors = options;
    }
  }
}

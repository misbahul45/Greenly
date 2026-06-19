const sensitiveKeys = [
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'accessToken',
  'authorization',
  'secret',
  'privateKey',
  'apiKey',
  'key',
];

export function sanitizeForLog(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeForLog);
  }

  const output: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    if (
      sensitiveKeys.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
      )
    ) {
      output[key] = '[REDACTED]';
    } else {
      output[key] = sanitizeForLog(val);
    }
  }

  return output;
}

export function stringifyForLog(value: unknown): string {
  try {
    return JSON.stringify(sanitizeForLog(value));
  } catch {
    return String(value);
  }
}

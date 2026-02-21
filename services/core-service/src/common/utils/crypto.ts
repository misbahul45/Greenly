import * as crypto from 'crypto';


export function generateOtp(length = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return crypto.randomInt(min, max + 1).toString();
}


export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}



export function verifyHash(rawValue: string, hashedValue: string): boolean {
  const hashedIncoming = hashValue(rawValue);

  return crypto.timingSafeEqual(
    Buffer.from(hashedIncoming),
    Buffer.from(hashedValue),
  );
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
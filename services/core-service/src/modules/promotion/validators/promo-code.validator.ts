export function isValidPromoCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{3,20}$/.test(code);
}

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

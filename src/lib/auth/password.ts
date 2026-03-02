import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;

  const [salt, storedHashHex] = parts;
  const derived = scryptSync(password, salt, KEY_LENGTH);
  const storedHash = Buffer.from(storedHashHex, 'hex');

  if (derived.length !== storedHash.length) return false;
  return timingSafeEqual(derived, storedHash);
}

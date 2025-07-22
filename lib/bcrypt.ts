import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(input: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(input, hashed);
}

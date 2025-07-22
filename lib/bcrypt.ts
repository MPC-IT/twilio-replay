import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
}

export function verifyPassword(input: string, hashed: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(input, hashed, (err, isValid) => {
      if (err) reject(err);
      else resolve(isValid);
    });
  });
}

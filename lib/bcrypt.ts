import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(password: string | undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof password !== 'string') {
      return reject(new Error('Invalid password input'));
    }

    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
}

export function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

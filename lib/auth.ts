import * as bcrypt from 'bcryptjs';

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err || !hash) reject(err || new Error('Hashing failed'));
      else resolve(hash);
    });
  });
}

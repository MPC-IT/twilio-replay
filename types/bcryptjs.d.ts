declare module 'bcryptjs' {
  export function hash(
    s: string,
    salt: number | string,
    cb: (err: Error, encrypted: string) => void
  ): void;

  export function hashSync(s: string, salt: number | string): string;

  export function compare(
    s: string,
    hash: string,
    cb: (err: Error, same: boolean) => void
  ): void;

  export function compareSync(s: string, hash: string): boolean;

  export function genSaltSync(rounds?: number): string;

  export function genSalt(rounds: number, cb: (err: Error, salt: string) => void): void;

  export const version: string;
}

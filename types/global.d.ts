// global.d.ts or a `types/env.d.ts` file
declare namespace NodeJS {
  interface ProcessEnv {
    SENTRY_DSN?: string;
    // add other environment variables here as needed
  }

  interface Process {
    env: ProcessEnv;
  }
}

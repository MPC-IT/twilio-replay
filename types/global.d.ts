// types/global.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;

    // Twilio
    TWILIO_SID?: string;
    TWILIO_AUTH?: string;

    // NextAuth
    NEXTAUTH_SECRET?: string;
    NEXTAUTH_URL?: string;

    // Database
    DATABASE_URL?: string;
    DIRECT_URL?: string;

    // Supabase
    SUPABASE_SERVICE_ROLE_KEY?: string;
    SUPABASE_JWT_SECRET?: string;

    // Optional: Add others like SENTRY_DSN if you use them
    SENTRY_DSN?: string;
  }

  interface Process {
    env: ProcessEnv;
  }
}

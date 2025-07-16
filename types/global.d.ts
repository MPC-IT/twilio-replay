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

    // Optional
    SENTRY_DSN?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}

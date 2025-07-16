export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      TWILIO_SID?: string;
      TWILIO_AUTH?: string;
      ADMIN_EMAIL?: string;
      ADMIN_PASSWORD?: string;
      SUPABASE_SERVICE_ROLE_KEY?: string;
      SUPABASE_JWT_SECRET?: string;
    }
  }
}

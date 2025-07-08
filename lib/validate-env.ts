const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'SENTRY_DSN',
  'TWILIO_SID',
  'TWILIO_AUTH',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
];

export function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const message = `⚠️ Missing required ENV vars: ${missing.join(', ')}`;

    if (process.env.NODE_ENV === 'production') {
      console.error(`❌ ${message}`);
      process.exit(1);
    } else {
      console.warn(message);
    }
  }
}

// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN, // get this from sentry.io project settings
  tracesSampleRate: 1.0,
});

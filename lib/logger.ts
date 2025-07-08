// lib/logger.ts
import * as Sentry from '@sentry/node'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  })
}

export const logError = (label: string, err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[${label}]`, message)
  Sentry.captureException(err)
}

// File: pages/api/sentry-debug.ts

import * as Sentry from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const error = new Error('🧨 Sentry test error from /api/sentry-debug')
  Sentry.captureException(error)

  res.status(500).json({
    message: 'Intentional Sentry error triggered. Check your dashboard.',
  })
}

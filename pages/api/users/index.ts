import type { NextApiRequest, NextApiResponse } from 'next'
import type { User } from '@prisma/client'

export default function handler(req: NextApiRequest, res: NextApiResponse<User[]>) {
  res.status(200).json([
    { id: 1, name: 'Admin User', email: 'admin@mpc.com', isSuspended: false },
    { id: 2, name: 'Leesa Moore', email: 'leesa@multipointcom.com', isSuspended: false },
  ])
}

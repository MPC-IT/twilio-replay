import type { NextApiRequest, NextApiResponse } from 'next'

type PublicUser = {
  id: number;
  name: string;
  email: string;
  isSuspended: boolean;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicUser[]>
) {
  res.status(200).json([
    { id: 1, name: 'Admin User', email: 'admin@mpc.com', isSuspended: false },
    { id: 2, name: 'Leesa Moore', email: 'leesa@multipointcom.com', isSuspended: false },
  ])
}

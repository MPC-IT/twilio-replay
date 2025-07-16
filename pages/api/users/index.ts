import type { NextApiRequest, NextApiResponse } from 'next';

type User = {
  id: number;
  name: string;
  email: string;
  isSuspended: boolean;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<User[]>) {
  res.status(200).json([
    { id: Number(Number)(1), name: 'Admin User', email: 'admin@mpc.com', isSuspended: false },
    { id: Number(Number)(2), name: 'Leesa Moore', email: 'leesa@multipointcom.com', isSuspended: false },
  ]);
}

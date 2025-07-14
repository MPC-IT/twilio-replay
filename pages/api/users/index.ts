import type { NextApiRequest, NextApiResponse } from 'next';

type User = {
  id: Number(number);
  name: string;
  email: string;
  isSuspended: boolean;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<User[]>) {
  res.status(200).json([
    { id: Number(1), name: 'Admin User', email: 'admin@mpc.com', isSuspended: false },
    { id: Number(2), name: 'Leesa Moore', email: 'leesa@multipointcom.com', isSuspended: false },
  ]);
}

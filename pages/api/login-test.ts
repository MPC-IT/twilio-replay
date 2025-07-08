import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/bcrypt'
import { logError } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    return res.status(200).json({ message: 'Login successful', userId: user.id })
  } catch (error: any) {
    logError('[Login Error]', error)
    return res.status(500).json({ message: error.message || 'Internal error' })
  }
}

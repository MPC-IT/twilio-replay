import { hashPassword, verifyPassword } from '@/lib/bcrypt'

describe('bcrypt helpers', () => {
  it('should hash and verify a password successfully', async () => {
    const raw = 'test-password'
    const hash = await hashPassword(raw)

    expect(typeof hash).toBe('string')
    expect(hash).not.toBe(raw)

    const isValid = await verifyPassword(raw, hash)
    expect(isValid).toBe(true)
  })

  it('should fail verification for incorrect password', async () => {
    const raw = 'test-password'
    const hash = await hashPassword(raw)

    const isValid = await verifyPassword('wrong-password', hash)
    expect(isValid).toBe(false)
  })
})

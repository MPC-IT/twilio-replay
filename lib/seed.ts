import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function runSeed() {
  const passwordHash = bcrypt.hashSync('woctemp205', 10);

  await prisma.user.createMany({
    data: [
      {
        email: 'leesa@multipointcom.com',
        password: passwordHash,
        isAdmin: true,
        isSuspended: false,
      },
      {
        email: 'ashley@multipointcom.com',
        password: passwordHash,
        isAdmin: false,
        isSuspended: false,
      },
    ],
  });
}

// If you want to run the seed directly with `ts-node lib/seed.ts`
if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('Seed completed.');
      return prisma.$disconnect();
    })
    .catch((e) => {
      console.error('Seed failed:', e);
      return prisma.$disconnect().finally(() => process.exit(1));
    });
}

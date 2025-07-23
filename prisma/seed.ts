import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcryptjs.hashSync('woctemp205', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'leesa@multipointcom.com' },
    update: {},
    create: {
      name: 'Leesa Moore',
      email: 'leesa@multipointcom.com',
      password: passwordHash,
      isAdmin: true,
      isSuspended: false,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'ashley@multipointcom.com' },
    update: {},
    create: {
      name: 'Ashley Files',
      email: 'ashley@multipointcom.com',
      password: passwordHash,
      isAdmin: false,
      isSuspended: false,
    },
  });

  console.log({ user1, user2 });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
// prisma/seed.ts (CommonJS version)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'leesa@multipointcom.com';
  const password = 'woctemp205';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: 'Leesa Moore',
        role: 'admin',
        isAdmin: true,
        suspended: false,
      },
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  const codeInt = 123456;
  const existingReplay = await prisma.replay.findUnique({
    where: { codeInt },
  });

  if (!existingReplay) {
    await prisma.replay.create({
      data: {
        code: String(codeInt),
        codeInt,
        title: 'Demo Replay',
        startTime: new Date(),
        endTime: null,
        createdBy: Number(email),
      },
    });
    console.log('✅ Demo replay created');
  } else {
    console.log('ℹ️ Demo replay already exists');
  }
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

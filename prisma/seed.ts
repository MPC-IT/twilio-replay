import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('woctemp205', 10);

  // Seed admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Leesa Moore',
      email: 'leesa@multipointcom.com',
      password: hashedPassword,
      isAdmin: true,
      isSuspended: false,
    },
  });

  // Seed basic user
  const user = await prisma.user.create({
    data: {
      name: 'Ashley Files',
      email: 'ashley@multipointcom.com',
      password: hashedPassword,
      isAdmin: false,
      isSuspended: false,
    },
  });

  // Seed Replay for each user
  await prisma.replay.createMany({
    data: [
      {
        code: 12345,
        codeInt: 12345,
        replayId: 12345,
        title: 'Acme Q2 Conference',
        startTime: new Date('2025-07-01T10:00:00Z'),
        endTime: new Date('2025-07-01T11:00:00Z'),
        notes: 'Quarterly results, investor Q&A',
        createdBy: admin.id,
      },
      {
        code: 67890,
        codeInt: 67890,
        replayId: 67890,
        title: 'Client Kickoff - BlueSky Inc.',
        startTime: new Date('2025-07-10T14:30:00Z'),
        endTime: new Date('2025-07-10T15:00:00Z'),
        notes: 'New client onboarding call',
        createdBy: user.id,
      },
    ],
  });
}

main()
  .then(() => {
    console.log('✅ Seed data deployed successfully.');
  })
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function runSeed() {
  const passwordHash = await bcrypt.hash('woctemp205', 10);

  await prisma.user.createMany({
    data: [
      {
        name: 'Leesa Moore',
        email: 'leesa@multipointcom.com',
        password: passwordHash,
        role: 'ADMIN',
        isSuspended: false,
      },
      {
        name: 'Ashley Files',
        email: 'ashley@multipointcom.com',
        password: passwordHash,
        role: 'USER',
        isSuspended: false,
      },
    ],
  });

  await prisma.replay.create({
    data: {
      id: '12345',
      code: '12345',
      codeInt: 12345,
      replayId: '12345',
      title: 'Weekly Sales Recap',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      notes: 'Review of Q2 performance',
      createdBy: 'leesa@multipointcom.com',
    },
  });

  await prisma.recording.create({
    data: {
      replayId: 12345,
      name: 'Conference Recording - ABC123',
      audioUrl: '/recordings/12345.mp3',
      transcription: '',
    },
  });

  await prisma.usage.create({
    data: {
      replayId: 12345,
      callerId: '+12055551234',
      durationSeconds: 145,
      firstNameUrl: 'https://example.com/first.wav',
      lastNameUrl: 'https://example.com/last.wav',
      companyUrl: 'https://example.com/company.wav',
      phoneUrl: 'https://example.com/phone.wav',
    },
  });

  await prisma.$disconnect();
}

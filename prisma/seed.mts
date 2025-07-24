import * as bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

async function main() {
  console.log("🔄 Starting seed script...");

  // Seed users
  console.log("👥 Seeding users...");
  const passwordHash = await bcrypt.hash('woctemp205', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Leesa Moore',
      email: 'leesa@multipointcom.com',
      password: passwordHash,
      isAdmin: true,
      isSuspended: false,
    },
  });
  console.log(`✅ Created admin user: ${user1.email}`);

  const user2 = await prisma.user.create({
    data: {
      name: 'Ashley Files',
      email: 'ashley@multipointcom.com',
      password: passwordHash,
      isAdmin: false,
      isSuspended: false,
    },
  });
  console.log(`✅ Created user: ${user2.email}`);

  // Seed replays
  console.log("🎧 Seeding replays...");

  const replay1 = await prisma.replay.create({
    data: {
      code: 12345,
      codeInt: 12345,
      replayId: 12345,
      title: 'MPC Training Call',
      startTime: new Date('2025-07-01T10:00:00'),
      endTime: new Date('2025-07-01T11:00:00'),
      notes: 'Intro training session for MPC staff',
      createdBy: user1.id,
      promptOrder: ['firstName', 'lastName', 'company', 'phone'],
      company: 'Multipoint Communications',
    },
  });
  console.log(`✅ Created replay: ${replay1.title}`);

  const replay2 = await prisma.replay.create({
    data: {
      code: 67890,
      codeInt: 67890,
      replayId: 67890,
      title: 'XYZ Investor Call',
      startTime: new Date('2025-07-10T14:00:00'),
      endTime: new Date('2025-07-10T15:00:00'),
      notes: 'Quarterly investment strategy review',
      createdBy: user2.id,
      promptOrder: ['firstName', 'lastName', 'company', 'phone'],
      company: 'XYZ Holdings',
    },
  });
  console.log(`✅ Created replay: ${replay2.title}`);

  // Seed prompts
  console.log("🔊 Seeding prompt recordings...");

  const promptTypes = ['firstName', 'lastName', 'company', 'phone'];

  for (const type of promptTypes) {
    await prisma.prompt.create({
      data: {
        replayId: replay1.id,
        type,
        audioUrl: `/prompts/${type}.mp3`,
      },
    });
    console.log(`🎙️ Created prompt "${type}" for ${replay1.title}`);
  }

  for (const type of promptTypes) {
    await prisma.prompt.create({
      data: {
        replayId: replay2.id,
        type,
        audioUrl: `/prompts/${type}.mp3`,
      },
    });
    console.log(`🎙️ Created prompt "${type}" for ${replay2.title}`);
  }

  // Seed recordings
  console.log("📼 Seeding replay audio recordings...");

  await prisma.recording.create({
    data: {
      replayId: replay1.id,
      label: 'MPC Training Call Recording',
      audioUrl: '/recordings/12345.mp3',
    },
  });
  console.log(`✅ Recording added for replay ${replay1.code}`);

  await prisma.recording.create({
    data: {
      replayId: replay2.id,
      label: 'XYZ Investor Call Audio',
      audioUrl: '/recordings/67890.mp3',
    },
  });
  console.log(`✅ Recording added for replay ${replay2.code}`);

  console.log("🌱 Seeding complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Error during seeding:", e);
  process.exit(1);
});

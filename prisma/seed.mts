import * as bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

async function main() {
  console.log("🔄 Starting seed script...");

  // Seed users
  try {
    console.log("👥 Seeding users...");
    const passwordHash = await bcrypt.hash('woctemp205', 10);

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
    console.log(`✅ Created admin user: ${user1.email}`);

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
    console.log(`✅ Created user: ${user2.email}`);
  } catch (err) {
    console.error("❌ Error seeding users:", err);
  }

  // Seed replays
  const replays = [
    {
      code: 12345,
      title: 'MPC Training Call',
      notes: 'Intro training session for MPC staff',
      company: 'Multipoint Communications',
      createdByEmail: 'leesa@multipointcom.com',
    },
    {
      code: 67890,
      title: 'XYZ Investor Call',
      notes: 'Quarterly investment strategy review',
      company: 'XYZ Holdings',
      createdByEmail: 'ashley@multipointcom.com',
    },
    {
      code: 54321,
      title: 'Vendor Onboarding Call',
      notes: 'Call with new vendor reps',
      company: 'Acme Suppliers',
      createdByEmail: 'leesa@multipointcom.com',
    },
    {
      code: 98765,
      title: 'Customer Success Review',
      notes: 'Q2 feedback call with top clients',
      company: 'ClientBridge Co',
      createdByEmail: 'ashley@multipointcom.com',
    },
  ];

  const replayRefs: any[] = [];

  try {
    console.log("🎧 Seeding replays...");
    for (const replay of replays) {
      const user = await prisma.user.findUnique({ where: { email: replay.createdByEmail } });
      if (!user) {
        console.warn(`⚠ Skipping replay "${replay.title}" — user not found`);
        continue;
      }

      try {
        const created = await prisma.replay.create({
          data: {
            code: replay.code,
            codeInt: replay.code,
            replayId: replay.code,
            title: replay.title,
            startTime: new Date('2025-07-01T10:00:00'),
            endTime: new Date('2025-07-01T11:00:00'),
            notes: replay.notes,
            createdBy: user.id,
            promptOrder: ['firstName', 'lastName', 'company', 'phone'],
            company: replay.company,
          },
        });
        console.log(`✅ Created replay: ${created.title}`);
        replayRefs.push(created);
      } catch (e) {
        console.warn(`⚠ Skipped replay "${replay.title}" — likely already exists.`);
      }
    }
  } catch (err) {
    console.error("❌ Error seeding replays:", err);
  }

  // Seed prompts
  try {
    console.log("🔊 Seeding prompt recordings...");
    const promptTypes = ['firstName', 'lastName', 'company', 'phone'];

    for (const replay of replayRefs) {
      for (const type of promptTypes) {
        await prisma.prompt.create({
          data: {
            replayId: replay.id,
            type,
            audioUrl: `/prompts/${type}.mp3`,
          },
        });
        console.log(`🎙️ Created prompt "${type}" for ${replay.title}`);
      }
    }
  } catch (err) {
    console.error("❌ Error seeding prompts:", err);
  }

  // Seed recordings
  try {
    console.log("📼 Seeding replay audio recordings...");
    for (const replay of replayRefs) {
      await prisma.recording.create({
        data: {
          replayId: replay.id,
          label: `${replay.title} Recording`,
          audioUrl: `/recordings/${replay.replayId}.mp3`,
        },
      });
      console.log(`✅ Recording added for replay ${replay.code}`);
    }
  } catch (err) {
    console.error("❌ Error seeding recordings:", err);
  }

  // Seed usage (callers)
  try {
    console.log("📞 Seeding caller usage...");
    const usageSamples = [
      {
        replayCode: 12345,
        callerId: 'CALL001',
        durationSeconds: 180,
        firstName: 'John', lastName: 'Smith', company: 'ABC Tech', phone: '555-123-4567',
      },
      {
        replayCode: 67890,
        callerId: 'CALL002',
        durationSeconds: 210,
        firstName: 'Emily', lastName: 'Johnson', company: 'XYZ Holdings', phone: '555-789-4321',
      },
      {
        replayCode: 54321,
        callerId: 'CALL003',
        durationSeconds: 165,
        firstName: 'Carlos', lastName: 'Reed', company: 'Acme Corp', phone: '555-246-8100',
      },
      {
        replayCode: 98765,
        callerId: 'CALL004',
        durationSeconds: 190,
        firstName: 'Sara', lastName: 'Blake', company: 'ClientBridge', phone: '555-908-1111',
      },
    ];

    for (const u of usageSamples) {
      const replay = replayRefs.find(r => r.code === u.replayCode);
      if (!replay) {
        console.warn(`⚠ Skipping usage for ${u.callerId} — replay ${u.replayCode} not found.`);
        continue;
      }

      await prisma.usage.create({
        data: {
          replayId: replay.id,
          callerId: u.callerId,
          durationSeconds: u.durationSeconds,
          firstNameRecordingUrl: `/caller-recordings/${u.callerId}_first.mp3`,
          lastNameRecordingUrl: `/caller-recordings/${u.callerId}_last.mp3`,
          companyRecordingUrl: `/caller-recordings/${u.callerId}_company.mp3`,
          phoneRecordingUrl: `/caller-recordings/${u.callerId}_phone.mp3`,
          firstName: u.firstName,
          lastName: u.lastName,
          company: u.company,
          phone: u.phone,
        },
      });
      console.log(`📲 Usage record seeded for ${u.callerId}`);
    }
  } catch (err) {
    console.error("❌ Error seeding usage:", err);
  }

  console.log("🌱 Seeding complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Fatal error during seed:", e);
  process.exit(1);
});

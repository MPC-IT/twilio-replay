import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

async function main() {
  const password = 'woctemp205';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create users
  await prisma.user.createMany({
    data: [
      {
        name: 'Leesa Moore',
        email: 'leesa@multipointcom.com',
        passwordHash: hashedPassword,
        isAdmin: true,
        isSuspended: false
      },
      {
        name: 'Ashley Files',
        email: 'ashley@multipointcom.com',
        passwordHash: hashedPassword,
        isAdmin: false,
        isSuspended: false
      }
    ],
    skipDuplicates: true
  });

  // Create replays
  await prisma.replay.createMany({
    data: [
      {
        id: 12345,
        code: '12345',
        codeInt: 12345,
        title: 'Quarterly Update',
        createdAt: new Date()
      },
      {
        id: 67890,
        code: '67890',
        codeInt: 67890,
        title: 'Product Launch Briefing',
        createdAt: new Date()
      }
    ]
  });

  // Attach prompt recordings to replays
  await prisma.prompt.createMany({
    data: [
      { replayId: 12345, type: 'firstName', recordingUrl: '/prompts/firstName.mp3' },
      { replayId: 12345, type: 'lastName', recordingUrl: '/prompts/lastName.mp3' },
      { replayId: 12345, type: 'company', recordingUrl: '/prompts/company.mp3' },
      { replayId: 12345, type: 'phone', recordingUrl: '/prompts/phone.mp3' },

      { replayId: 67890, type: 'firstName', recordingUrl: '/prompts/firstName.mp3' },
      { replayId: 67890, type: 'lastName', recordingUrl: '/prompts/lastName.mp3' },
      { replayId: 67890, type: 'company', recordingUrl: '/prompts/company.mp3' },
      { replayId: 67890, type: 'phone', recordingUrl: '/prompts/phone.mp3' }
    ]
  });

  // Add usage records (callers)
  await prisma.usage.createMany({
    data: [
      {
        replayId: 12345,
        callerId: 'caller001',
        durationSeconds: 100,
        createdAt: new Date(),
        firstName: 'Emily',
        lastName: 'Johnson',
        company: 'BlueTech Inc',
        phone: '555-1234',
        firstNameRecordingUrl: 'https://example.com/audio/emily_first.mp3',
        lastNameRecordingUrl: 'https://example.com/audio/emily_last.mp3',
        companyRecordingUrl: 'https://example.com/audio/emily_company.mp3',
        phoneRecordingUrl: 'https://example.com/audio/emily_phone.mp3'
      },
      {
        replayId: 67890,
        callerId: 'caller002',
        durationSeconds: 85,
        createdAt: new Date(),
        firstName: 'Mark',
        lastName: 'Stevens',
        company: 'NovaCorp',
        phone: '555-7890',
        firstNameRecordingUrl: 'https://example.com/audio/mark_first.mp3',
        lastNameRecordingUrl: 'https://example.com/audio/mark_last.mp3',
        companyRecordingUrl: 'https://example.com/audio/mark_company.mp3',
        phoneRecordingUrl: 'https://example.com/audio/mark_phone.mp3'
      }
    ]
  });

  // Final playback recordings
  await prisma.recording.createMany({
    data: [
      {
        replayId: 12345,
        recordingUrl: '/recordings/12345.mp3',
        uploadedBy: 'leesa@multipointcom.com',
        uploadedAt: new Date()
      },
      {
        replayId: 67890,
        recordingUrl: '/recordings/67890.mp3',
        uploadedBy: 'ashley@multipointcom.com',
        uploadedAt: new Date()
      }
    ]
  });

  console.log('✅ Mock data seeded successfully');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

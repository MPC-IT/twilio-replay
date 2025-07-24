import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  // Create replays
  await prisma.replay.createMany({
    data: [
      {
        code: 82476,
        codeInt: 82476,
        replayId: 82476,
        title: 'MPC Training Call',
        startTime: new Date('2025-05-19T14:00:00'),
        endTime: new Date('2025-05-19T14:30:00'),
        notes: 'Internal training session',
        createdBy: 1,
        company: 'Multipoint Communications'
      },
      {
        code: 92675,
        codeInt: 92675,
        replayId: 92675,
        title: 'XYZ Investor Call',
        startTime: new Date('2025-05-19T15:00:00'),
        endTime: new Date('2025-05-19T15:30:00'),
        notes: 'Quarterly earnings',
        createdBy: 1,
        company: 'XYZ Corp'
      },
      {
        code: 586,
        codeInt: 586,
        replayId: 586,
        title: 'Private Briefing',
        startTime: new Date('2025-05-18T10:00:00'),
        endTime: new Date('2025-05-18T10:20:00'),
        notes: 'Small group confidential call',
        createdBy: 1,
        company: 'Confidential'
      },
      {
        code: 40381,
        codeInt: 40381,
        replayId: 40381,
        title: 'XYZ M&A Update',
        startTime: new Date('2025-05-17T13:00:00'),
        endTime: new Date('2025-05-17T13:45:00'),
        notes: 'Merger & acquisition briefing',
        createdBy: 1,
        company: 'XYZ Corp'
      }
    ]
  });

  // Create recordings
  await prisma.recording.createMany({
    data: [
      { replayId: 82476, label: 'MPC Training Call', audioUrl: '/recordings/82476.mp3' },
      { replayId: 92675, label: 'XYZ Investor Call', audioUrl: '/recordings/92675.mp3' },
      { replayId: 586, label: 'Private Briefing', audioUrl: '/recordings/586.mp3' },
      { replayId: 40381, label: 'XYZ M&A Update', audioUrl: '/recordings/40381.mp3' }
    ]
  });

  // Create standard prompts for each replay
  const promptTypes = ['firstName', 'lastName', 'company', 'phone'];
  const promptEntries = [82476, 92675, 586, 40381].flatMap((replayId) =>
    promptTypes.map((type) => ({
      replayId,
      type,
      audioUrl: `/prompts/${type}.wav`
    }))
  );

  await prisma.prompt.createMany({
    data: promptEntries
  });

  // Create usage records (example set from previous data)
  const usageRecords = [
    {
      replayId: 82476,
      callerId: "Caller-82476-1",
      durationSeconds: 75,
      firstName: "Caitlin",
      lastName: "Harris",
      company: "Ramsey Group",
      phone: "007-874-2359x83137",
      firstNameRecordingUrl: "/recordings/fn1.mp3",
      lastNameRecordingUrl: "/recordings/ln1.mp3",
      companyRecordingUrl: "/recordings/co1.mp3",
      phoneRecordingUrl: "/recordings/ph1.mp3"
    },
    {
      replayId: 82476,
      callerId: "Caller-82476-2",
      durationSeconds: 90,
      firstName: "Austin",
      lastName: "Webb",
      company: "Reeves Group",
      phone: "113-289-3881",
      firstNameRecordingUrl: "/recordings/fn2.mp3",
      lastNameRecordingUrl: "/recordings/ln2.mp3",
      companyRecordingUrl: "/recordings/co2.mp3",
      phoneRecordingUrl: "/recordings/ph2.mp3"
    },
    {
      replayId: 92675,
      callerId: "Caller-92675-1",
      durationSeconds: 120,
      firstName: "Kaitlin",
      lastName: "Hill",
      company: "Carr Ltd",
      phone: "(380) 769-2536x093",
      firstNameRecordingUrl: "/recordings/fn3.mp3",
      lastNameRecordingUrl: "/recordings/ln3.mp3",
      companyRecordingUrl: "/recordings/co3.mp3",
      phoneRecordingUrl: "/recordings/ph3.mp3"
    },
    {
      replayId: 586,
      callerId: "Caller-586-1",
      durationSeconds: 105,
      firstName: "Kelsey",
      lastName: "Baldwin",
      company: "Smith PLC",
      phone: "(267) 701-2903",
      firstNameRecordingUrl: "/recordings/fn4.mp3",
      lastNameRecordingUrl: "/recordings/ln4.mp3",
      companyRecordingUrl: "/recordings/co4.mp3",
      phoneRecordingUrl: "/recordings/ph4.mp3"
    },
    {
      replayId: 40381,
      callerId: "Caller-40381-1",
      durationSeconds: 99,
      firstName: "Morgan",
      lastName: "Conley",
      company: "Chavez and Sons",
      phone: "354.099.2170",
      firstNameRecordingUrl: "/recordings/fn5.mp3",
      lastNameRecordingUrl: "/recordings/ln5.mp3",
      companyRecordingUrl: "/recordings/co5.mp3",
      phoneRecordingUrl: "/recordings/ph5.mp3"
    }
  ];

  for (const usage of usageRecords) {
    await prisma.usage.create({ data: usage });
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

 
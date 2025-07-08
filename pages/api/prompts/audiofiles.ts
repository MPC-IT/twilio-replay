import type { NextApiRequest, NextApiResponse } from 'next';

// Static list of available prompts — never changes
const promptAudioFiles = [
  {
    id: '1',
    type: 'spellFirstName',
    label: 'Spell First Name Prompt 1',
    audioUrl: '/prompts/spell_first_name_1.mp3',
  },
  {
    id: '2',
    type: 'spellFirstName',
    label: 'Spell First Name Prompt 2',
    audioUrl: '/prompts/spell_first_name_2.mp3',
  },
  {
    id: '3',
    type: 'spellLastName',
    label: 'Spell Last Name Prompt 1',
    audioUrl: '/prompts/spell_last_name_1.mp3',
  },
  {
    id: '4',
    type: 'company',
    label: 'Company Name Prompt 1',
    audioUrl: '/prompts/company_name_1.mp3',
  },
  {
    id: '5',
    type: 'phone',
    label: 'Phone Number Prompt 1',
    audioUrl: '/prompts/phone_number_1.mp3',
  },
  // Add more prompts as needed
];

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(promptAudioFiles);
}

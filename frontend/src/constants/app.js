export const MODELS = [
  {
    id: 'clariq-socratic',
    name: 'Clariq Socratic',
    description: 'Step-by-step questions. Does not hand over the answer.',
  },
];

export const SOCRATIC_MODES = [
  {
    id: 'strict',
    title: 'Strict',
    description: 'Never gives the answer. Guides with one question at a time.',
  },
  {
    id: 'guided',
    title: 'Guided',
    description: 'Gives a short hint, then asks a follow-up.',
  },
  {
    id: 'direct',
    title: 'Direct',
    description: 'Explains first, then checks understanding.',
  },
];

export const STARTER_PROMPTS = [
  {
    title: "Newton's first law",
    subtitle: 'Why do objects keep moving in space?',
    query: 'Help me understand Newton\'s first law using Socratic questions.',
  },
  {
    title: 'DNA replication',
    subtitle: 'How is genetic information copied?',
    query: 'Guide me through DNA replication one step at a time.',
  },
  {
    title: 'Balancing equations',
    subtitle: 'Conservation of mass in reactions',
    query: 'How do I balance a chemical equation? Walk me through an example without giving the final answer.',
  },
  {
    title: 'Refraction of light',
    subtitle: 'Why a pencil looks bent in water',
    query: 'Why does light bend when it goes from air to water? Start by testing my intuition.',
  },
];

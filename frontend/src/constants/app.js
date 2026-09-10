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
    subject: 'Physics',
    title: "Newton's first law",
    subtitle: 'Why do objects keep moving in space?',
    query: "Help me understand Newton's first law using Socratic questions.",
  },
  {
    subject: 'Physics',
    title: 'Refraction of light',
    subtitle: 'Why a pencil looks bent in water',
    query: 'Why does light bend when it goes from air to water? Start by testing my intuition.',
  },
  {
    subject: 'Chemistry',
    title: 'Balancing equations',
    subtitle: 'Conservation of mass in reactions',
    query: 'How do I balance a chemical equation? Walk me through an example without giving the final answer.',
  },
  {
    subject: 'Chemistry',
    title: 'Atoms and molecules',
    subtitle: 'What is actually changing in a reaction?',
    query: 'Guide me to explain the difference between an atom and a molecule with one question at a time.',
  },
  {
    subject: 'Biology',
    title: 'DNA replication',
    subtitle: 'How is genetic information copied?',
    query: 'Guide me through DNA replication one step at a time.',
  },
  {
    subject: 'Biology',
    title: 'Photosynthesis',
    subtitle: 'How plants store sunlight as food',
    query: 'Help me reason about photosynthesis without giving the full equation first.',
  },
  {
    subject: 'Earth',
    title: 'Water cycle',
    subtitle: 'Where does rain come from?',
    query: 'Ask me Socratic questions about the water cycle until I can explain it myself.',
  },
  {
    subject: 'Earth',
    title: 'Seasons',
    subtitle: 'Why Earth is not hotter in January everywhere',
    query: 'Help me figure out why we have seasons. Do not start with the answer.',
  },
];

export const SUBJECTS = [...new Set(STARTER_PROMPTS.map((item) => item.subject))];

export const PENDING_PROMPT_KEY = 'clariq_pending_prompt';

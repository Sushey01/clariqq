export type Persona = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
};

export const PERSONAS: Persona[] = [
  {
    id: 'socratic-mentor',
    name: 'Socratic Mentor',
    tagline: 'Strict inquiry-based learning',
    description: 'Never gives direct answers. Guides discovery through targeted questions.',
    icon: 'sparkles-outline',
    accent: '#22d3ee',
  },
  {
    id: 'exam-coach',
    name: 'SEE Exam Coach',
    tagline: 'Grade 10 SEE Exam Practice',
    description: 'Focuses on exam mark schemes, past paper formats, and timed answers.',
    icon: 'school-outline',
    accent: '#10b981',
  },
  {
    id: 'lab-assistant',
    name: 'Lab Assistant',
    tagline: 'Hands-on Science & Experiments',
    description: 'Guides experimental reasoning, hypotheses, variables, and safety.',
    icon: 'flask-outline',
    accent: '#a855f7',
  },
  {
    id: 'study-buddy',
    name: 'Peer Study Buddy',
    tagline: 'Collaborative Problem Solver',
    description: 'Friendly, encouraging checks for understanding and study tricks.',
    icon: 'people-outline',
    accent: '#f59e0b',
  },
];

export type SocraticMode = {
  id: 'strict' | 'guided' | 'direct';
  title: string;
  description: string;
};

export const SOCRATIC_MODES: SocraticMode[] = [
  {
    id: 'strict',
    title: 'Strict',
    description: 'Never gives the answer. Guides with one question at a time.',
  },
  {
    id: 'guided',
    title: 'Guided',
    description: 'Gives a short hint, then asks a follow-up question.',
  },
  {
    id: 'direct',
    title: 'Direct',
    description: 'Explains first, then checks understanding.',
  },
];

export type ScienceTopic = {
  subject: 'Physics' | 'Chemistry' | 'Biology' | 'Earth';
  title: string;
  subtitle: string;
  query: string;
};

export const STARTER_PROMPTS: ScienceTopic[] = [
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

export type ScienceStation = {
  slug: 'physics' | 'chemistry' | 'biology' | 'earth';
  subject: string;
  kicker: string;
  headline: string;
  blurb: string;
  accent: string;
  topics: ScienceTopic[];
};

export const SCIENCE_STATIONS: ScienceStation[] = [
  {
    slug: 'physics',
    subject: 'Physics',
    kicker: 'Grade 10 SEE',
    headline: 'Motion, forces, and light',
    blurb: 'Start from what you observe. Clariq will not open with the formula.',
    accent: '#22d3ee',
    topics: STARTER_PROMPTS.filter((t) => t.subject === 'Physics'),
  },
  {
    slug: 'chemistry',
    subject: 'Chemistry',
    kicker: 'Grade 10 SEE',
    headline: 'Atoms, equations, and changes',
    blurb: 'Conservation of mass, not a balanced equation dumped in one bubble.',
    accent: '#a855f7',
    topics: STARTER_PROMPTS.filter((t) => t.subject === 'Chemistry'),
  },
  {
    slug: 'biology',
    subject: 'Biology',
    kicker: 'Grade 10 SEE',
    headline: 'Cells, DNA, and energy',
    blurb: 'Reason through living systems and genetics one step at a time.',
    accent: '#10b981',
    topics: STARTER_PROMPTS.filter((t) => t.subject === 'Biology'),
  },
  {
    slug: 'earth',
    subject: 'Earth & Space',
    kicker: 'Grade 10 SEE',
    headline: 'Water, atmosphere, and orbits',
    blurb: 'Explore seasons and climate without simple rote memorization.',
    accent: '#f59e0b',
    topics: STARTER_PROMPTS.filter((t) => t.subject === 'Earth'),
  },
];

export const QUICK_FOLLOW_UPS = [
  'Could you give me a hint?',
  'Why does that happen?',
  'Let me try to explain...',
  'Can you test me with another question?',
];

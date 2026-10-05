export const MODELS = [
  {
    id: 'clariq-socratic',
    name: 'Clariq Socratic',
    description: 'Step-by-step questions. Does not hand over the answer.',
  },
];

export const PERSONAS = [
  {
    id: 'socratic-mentor',
    name: 'Socratic Mentor',
    tagline: 'Strict inquiry-based learning',
    description: 'Never gives direct answers. Guides discovery through targeted questions.',
    icon: 'Sparkles',
    badgeVariant: 'indigo',
    color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
  },
  {
    id: 'exam-coach',
    name: 'SEE Exam Coach',
    tagline: 'Grade 10 SEE Exam Practice',
    description: 'Focuses on exam mark schemes, past paper formats, and timed answers.',
    icon: 'GraduationCap',
    badgeVariant: 'emerald',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'lab-assistant',
    name: 'Lab Assistant',
    tagline: 'Hands-on Science & Experiments',
    description: 'Guides experimental reasoning, hypotheses, variables, and safety.',
    icon: 'FlaskConical',
    badgeVariant: 'purple',
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
  },
  {
    id: 'study-buddy',
    name: 'Peer Study Buddy',
    tagline: 'Collaborative Problem Solver',
    description: 'Friendly, encouraging checks for understanding and study tricks.',
    icon: 'Users',
    badgeVariant: 'amber',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
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

export const SUBJECT_COPY = {
  Physics: 'Motion, forces, and light — one observation at a time.',
  Chemistry: 'Atoms, equations, and what actually changes in a reaction.',
  Biology: 'Cells, DNA, and how plants store sunlight.',
  Earth: 'Water, weather, and why seasons are not “closer to the sun”.',
};

export const PENDING_PROMPT_KEY = 'clariq_pending_prompt';

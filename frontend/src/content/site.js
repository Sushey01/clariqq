import { SOCRATIC_MODES, STARTER_PROMPTS } from '@/constants/app';

export const PROGRAMS = [
  {
    slug: 'physics',
    subject: 'Physics',
    kicker: 'Grade 10',
    headline: 'Motion, forces, and light',
    blurb: 'Start from what you can see. Clariq will not open with the formula.',
    bullets: [
      'Newton’s first law without memorizing the textbook sentence',
      'Why a pencil looks bent in water',
      'One observation, then one question',
    ],
    quote: 'I wanted the definition. I got “what would happen if there were no friction?”',
    quoteBy: 'A student stuck on Newton',
  },
  {
    slug: 'chemistry',
    subject: 'Chemistry',
    kicker: 'Grade 10',
    headline: 'Atoms, equations, and what actually changes',
    blurb: 'Conservation of mass, not a balanced equation dumped in one bubble.',
    bullets: [
      'Balancing equations by counting, not guessing',
      'Atom vs molecule until you can say it yourself',
      'Your notes can join the textbook after you sign in',
    ],
    quote: 'It pulled from my class PDF, then asked a smaller question.',
    quoteBy: 'A student who uploads notes',
  },
  {
    slug: 'biology',
    subject: 'Biology',
    kicker: 'Grade 10',
    headline: 'Cells, DNA, and how plants store sunlight',
    blurb: 'Photosynthesis without the full equation on turn one.',
    bullets: [
      'What a plant needs from its surroundings first',
      'DNA replication one step at a time',
      'Strict, guided, or direct — you pick the pressure',
    ],
    quote: 'I typed “what is photosynthesis” expecting the equation. I had to think.',
    quoteBy: 'A Grade 10 student',
  },
  {
    slug: 'earth',
    subject: 'Earth',
    kicker: 'Grade 10',
    headline: 'Water, weather, and seasons',
    blurb: 'Seasons are not “closer to the sun”. Clariq will make you defend that.',
    bullets: [
      'Where rain actually comes from',
      'Why January is not hotter everywhere',
      'A session you can pick up tomorrow',
    ],
    quote: 'I stopped copying and started answering out loud.',
    quoteBy: 'A student on the water cycle',
  },
].map((program) => ({
  ...program,
  topics: STARTER_PROMPTS.filter((item) => item.subject === program.subject),
}));

export function programBySlug(slug) {
  return PROGRAMS.find((program) => program.slug === slug);
}

export const STORIES = [
  {
    name: 'A Grade 10 student',
    place: 'Physics',
    line: 'I typed “what is photosynthesis” expecting the equation. Clariq asked what a plant needs from its surroundings first. I actually had to think.',
  },
  {
    name: 'A student who uploads notes',
    place: 'Chemistry',
    line: 'It pulled from my class PDF, then asked a smaller question. I stopped copying and started answering out loud.',
  },
  {
    name: 'A student stuck on Newton',
    place: 'Physics',
    line: 'I wanted the definition. I got “what would happen if there were no friction?” That was the real lesson.',
  },
  {
    name: 'A student on seasons',
    place: 'Earth',
    line: 'I was sure Earth is hotter when it is closer to the sun. Two questions later I could not defend that, and I finally wanted the diagram.',
  },
  {
    name: 'A student balancing equations',
    place: 'Chemistry',
    line: 'It would not write the finished reaction. It asked me to count atoms on the left. That was enough.',
  },
  {
    name: 'A student on DNA',
    place: 'Biology',
    line: 'I tried to skip to unzipping. Clariq asked why the cell would copy DNA at all. I had to start earlier than I wanted.',
  },
];

export const HOW_STEPS = [
  {
    n: '01',
    title: 'Pick a subject',
    body: 'Physics, chemistry, biology, or Earth — or type the question you are stuck on.',
  },
  {
    n: '02',
    title: 'Clariq retrieves a little',
    body: 'Textbook or your notes, just enough to ask the next smaller question. Not a chapter paste.',
  },
  {
    n: '03',
    title: 'You take a turn',
    body: 'A short, honest attempt. After a question, the next move is yours.',
  },
  {
    n: '04',
    title: 'The hint stays tiny',
    body: 'If you stall, you get a smaller nudge — not the full mechanism dumped in one bubble.',
  },
];

export const FAQ_GROUPS = [
  {
    id: 'start',
    title: 'Getting started',
    items: [
      {
        q: 'Do I need an account?',
        a: 'The demo is five student turns with no account. Sign in with Google to keep sessions and upload your own notes for RAG.',
      },
      {
        q: 'What subjects are available?',
        a: 'Grade 10 physics, chemistry, biology, and Earth science. Each subject has starter topics you can open as a session.',
      },
      {
        q: 'Where do sessions take place?',
        a: 'In the browser. There is no Zoom. Demo is on /demo. After sign-in, sessions live under learning home.',
      },
    ],
  },
  {
    id: 'tutor',
    title: 'The tutor',
    items: [
      {
        q: 'Is this ChatGPT with a science skin?',
        a: 'No. Clariq is built as a Socratic turn: retrieve a little textbook or your notes, then ask one question and wait. It is not meant to finish homework in one message.',
      },
      {
        q: 'Will it just give the answer if I ask twice?',
        a: 'In Strict mode it still will not dump the full answer. Guided adds a tiny hint. Direct explains a little, then checks understanding.',
      },
      {
        q: 'What if I am stuck?',
        a: 'Answer anyway, even badly. The next turn is a smaller question. Switch to Guided in session settings if you need a nudge.',
      },
    ],
  },
  {
    id: 'notes',
    title: 'Notes and safety',
    items: [
      {
        q: 'Can it use my class PDF?',
        a: 'Yes, after Google sign-in. Upload from learning home or the paperclip in a session. If embeddings are down, the file is saved but marked not indexed.',
      },
      {
        q: 'How do you keep this honest?',
        a: 'Clariq can be wrong. Check important facts against your textbook. The product promise is not omniscience — it is waiting for your turn.',
      },
    ],
  },
];

export const FAQ_HOME = FAQ_GROUPS.flatMap((group) => group.items).slice(0, 6);

export const VALUES = [
  {
    title: 'One question at a time',
    body: 'A dump is easy. A smaller question is the whole product.',
  },
  {
    title: 'Your turn is required',
    body: 'After Clariq asks, the next move is yours. That is not a bug in the UI.',
  },
  {
    title: 'Retrieve a little',
    body: 'Textbook or notes, only enough to ask well. Not a chapter in the bubble.',
  },
  {
    title: 'Always be a learner',
    body: 'A short, honest attempt beats a copied definition. Strict, guided, or direct.',
  },
];

export const NOTES = [
  {
    kicker: 'Method',
    title: 'Why Clariq waits',
    body: 'If the tutor speaks twice, you never have to. The wait is the pedagogy.',
  },
  {
    kicker: 'Subjects',
    title: 'Start from Grade 10 science',
    body: 'Four programs, eight starter topics. The same map lives in learning home after sign-in.',
  },
  {
    kicker: 'Notes',
    title: 'Your PDF can join the textbook',
    body: 'Upload after Google sign-in. If indexing is down, the file is kept and marked not ready.',
  },
];

export const TUTOR_FACES = SOCRATIC_MODES.map((mode, index) => ({
  ...mode,
  initial: mode.title[0],
  offset: index,
}));

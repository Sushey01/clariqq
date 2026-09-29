import { useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '@/auth/AuthContext';
import { homePathForRole, userRole } from '@/auth/roles';
import { usePageMeta } from '@/hooks/usePageMeta';
import MarketingShell from '@/components/layout/MarketingShell';
import LabHeroIsland from '@/components/lab/LabHeroIsland';

const HOME_TITLE = 'Clariq — Socratic Science Tutor for Class 10 Nepal';
const HOME_DESCRIPTION =
  'Clariq is a Grade 10 Nepal science lab that asks guided Socratic questions so students explain physics, chemistry, and biology instead of copying answers.';

const BENCHES = [
  {
    slug: 'physics',
    subject: 'Physics',
    line: 'Forces, patterns, and evidence',
    accent: '#22d3ee',
    to: '/demo',
    live: true,
  },
  {
    slug: 'chemistry',
    subject: 'Chemistry',
    line: 'Matter, reactions, and reasoning',
    accent: '#fb923c',
    to: '/demo',
    live: true,
  },
  {
    slug: 'biology',
    subject: 'Biology',
    line: 'Living systems and careful observation',
    accent: '#4ade80',
    to: '/demo',
    live: true,
  },
  {
    slug: 'earth',
    subject: 'Earth Science',
    line: 'Models, change, and real-world links',
    accent: '#7dd3fc',
    to: '/subjects/earth',
    live: false,
  },
];

const THREAD = [
  {
    who: 'Student',
    text: 'I know the definition, but I cannot explain the idea in my own words.',
  },
  {
    who: 'Clariq',
    text: 'What do you notice first? Name one thing that changes and one thing that stays the same.',
  },
  {
    who: 'Student',
    text: 'So I should compare the situation before and after instead of memorising the line?',
  },
  {
    who: 'Clariq',
    text: 'Exactly. Now turn that comparison into a short reason. What evidence would support it?',
  },
];

const SIGNALS = [
  {
    title: 'Reasoning trace',
    body: 'Shows how a student reached an idea, not just whether they typed the right line.',
  },
  {
    title: 'Knowledge pulse',
    body: 'Turns repeated gaps into simple signals for revision and support.',
  },
  {
    title: 'Teacher view',
    body: 'Keeps feedback practical, short, and connected to classroom decisions.',
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const root = useRef(null);

  usePageMeta({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: typeof window === 'undefined' ? undefined : window.location.origin + '/',
  });

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.from('.lab-hero-copy > *', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
      });
      gsap.utils.toArray('.lab-section').forEach((section) => {
        const items = section.querySelectorAll('.lab-reveal');
        if (!items.length) return;
        gsap.from(items, {
          scrollTrigger: { trigger: section, start: 'top 82%' },
          y: 32,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out',
        });
      });
    },
    { scope: root }
  );

  if (user) {
    return <Navigate to={homePathForRole(userRole(user))} replace />;
  }

  return (
    <MarketingShell>
      <main ref={root}>
        <section id="top" className="lab-section hero-band relative overflow-hidden">
          <span className="lab-orb-cyan pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full" />
          <span className="lab-orb-orange pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-20">
            <div className="lab-hero-copy">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
                Nepal · Class 10 science
              </p>
              <h1 className="mt-3 font-outfit text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
                Learn science by thinking, not copying answers.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed" style={{ color: 'var(--hero-muted)' }}>
                Clariq turns tough NEB ideas into guided questions, helps students explain their
                reasoning, and gives teachers clear learning signals.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/demo"
                  className="lab-cta-primary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Start a question path
                </Link>
                <a
                  href="#benches"
                  className="lab-cta-ghost inline-flex rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Enter the lab
                </a>
              </div>
            </div>
            <div className="min-h-[18rem] md:min-h-[22rem]">
              <LabHeroIsland />
            </div>
          </div>
        </section>

        <section id="benches" className="lab-section mx-auto max-w-6xl px-5 py-20">
          <p className="lab-reveal text-xs font-medium uppercase tracking-[0.2em] text-[var(--ink-faint)]">
            Choose a bench
          </p>
          <h2 className="lab-reveal mt-2 max-w-xl font-outfit text-4xl font-semibold">
            A spatial lab for the big science areas.
          </h2>
          <p className="lab-reveal mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)]">
            The homepage stays light: no syllabus lists, no wall of chapters. Each bench points students
            toward exploration and question-led practice.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {BENCHES.map((bench) => (
              <Link
                key={bench.slug}
                to={bench.to}
                className="lab-reveal lab-glass block rounded-[1.75rem] p-7 transition hover:border-[var(--accent)]"
                style={{ boxShadow: `inset 0 0 0 1px ${bench.accent}22` }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: bench.accent }}>
                  {bench.live ? 'Open bench' : 'Context only'}
                </p>
                <h3 className="mt-2 font-outfit text-2xl font-semibold">{bench.subject}</h3>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{bench.line}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="tutor-preview" className="lab-section bg-[var(--bg-raised)]">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <p className="lab-reveal text-xs font-medium uppercase tracking-[0.2em] text-[var(--ink-faint)]">
              Question-led tutor
            </p>
            <h2 className="lab-reveal mt-2 max-w-xl font-outfit text-4xl font-semibold">
              The tutor does not rush to the final answer.
            </h2>
            <p className="lab-reveal mt-3 max-w-2xl text-sm text-[var(--ink-muted)]">
              It asks for observations, checks reasoning, and helps students build an explanation step by
              step. The live thread stays 2D and readable.
            </p>
            <div className="lab-reveal lab-glass mt-10 space-y-4 rounded-[1.75rem] p-6 md:p-8">
              {THREAD.map((turn) => (
                <div key={turn.text} className="max-w-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                    {turn.who}
                  </p>
                  <p
                    className={
                      turn.who === 'Clariq'
                        ? 'mt-1 rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3 text-sm leading-relaxed'
                        : 'mt-1 rounded-2xl bg-[var(--bg-bubble)] px-4 py-3 text-sm leading-relaxed'
                    }
                  >
                    {turn.text}
                  </p>
                </div>
              ))}
            </div>
            <Link
              to="/demo"
              className="lab-reveal mt-8 inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold"
            >
              Open the 2D tutor
            </Link>
          </div>
        </section>

        <section id="signals" className="lab-section mx-auto max-w-6xl px-5 py-20">
          <p className="lab-reveal text-xs font-medium uppercase tracking-[0.2em] text-[var(--ink-faint)]">
            Adaptive signals
          </p>
          <h2 className="lab-reveal mt-2 max-w-xl font-outfit text-4xl font-semibold">
            Progress students and teachers can act on.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {SIGNALS.map((signal) => (
              <article key={signal.title} className="lab-reveal lab-glass rounded-[1.75rem] p-7">
                <h3 className="font-outfit text-xl font-semibold">{signal.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{signal.body}</p>
              </article>
            ))}
          </div>
          <div className="lab-reveal mt-10 flex flex-wrap gap-3">
            <Link to="/for-students" className="lab-cta-ghost inline-flex rounded-full px-5 py-2.5 text-sm font-semibold">
              For students
            </Link>
            <Link to="/for-teachers" className="lab-cta-ghost inline-flex rounded-full px-5 py-2.5 text-sm font-semibold">
              For teachers
            </Link>
          </div>
        </section>

        <section className="lab-section mx-auto max-w-6xl px-5 pb-20">
          <div className="lab-reveal lab-glass rounded-[1.75rem] px-6 py-12 text-center md:px-12">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--ink-faint)]">
              Clariq cool lab
            </p>
            <h2 className="mt-3 font-outfit text-3xl font-semibold md:text-4xl">
              A cinematic front door for a serious Socratic tutor.
            </h2>
            <Link
              to="/demo"
              className="lab-cta-primary mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold"
            >
              Start a question path
            </Link>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}

import { Link } from 'react-router-dom';
import MarketingShell from '@/components/layout/MarketingShell';
import PageHero from '@/components/marketing/PageHero';
import StatStrip from '@/components/marketing/StatStrip';
import { VALUES } from '@/content/site';
import TryDemoButton from '@/components/auth/TryDemoButton';

export default function AboutPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          dark
          eyebrow="About"
          title="We’re on a mission to make the next smaller question the default."
          body="Clariq is a Grade 10 Socratic science tutor. Students come for an explanation and stay because they have to take a turn."
        >
          <TryDemoButton variant="hero" label="Start Learning" />
        </PageHero>
        <StatStrip />
        <section className="mx-auto max-w-3xl px-5 py-16 text-base leading-relaxed text-[var(--ink-muted)]">
          <p>
            Clariq started as a simple idea: a science tutor should not finish the homework. It should
            retrieve a little from a textbook or a student’s notes, ask one question, and wait.
          </p>
          <p className="mt-5">
            The session is not a video call. It is a Socratic thread in the browser — Strict, Guided, or
            Direct. After you sign in, your PDFs can join the textbook in retrieval.
          </p>
          <p className="mt-5">
            As chatbots get better at dumping answers, we think students still need something slower:
            encouragement to reason out loud, and a product that will not speak twice in a row if you
            have not answered.
          </p>
        </section>
        <section className="bg-[var(--bg-raised)]">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="font-outfit text-3xl font-semibold">How we show up</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {VALUES.map((value) => (
                <div key={value.title} className="lab-glass rounded-[1.75rem] p-7">
                  <h3 className="font-outfit text-xl font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{value.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2">
          <Link
            to="/for-students"
            className="lab-glass rounded-[1.75rem] p-8 hover:border-[var(--accent)]"
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-faint)]">
              For students
            </p>
            <h2 className="mt-2 font-outfit text-2xl font-semibold">Bring a question. Take a turn.</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Demo is five turns. Sign in to keep sessions and upload notes.
            </p>
          </Link>
          <Link
            to="/for-teachers"
            className="lab-glass rounded-[1.75rem] p-8 hover:border-[var(--accent)]"
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-faint)]">
              For teachers
            </p>
            <h2 className="mt-2 font-outfit text-2xl font-semibold">It will not finish the worksheet.</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Strict mode still waits. Guided adds a tiny hint. Direct checks understanding.
            </p>
          </Link>
        </section>
      </main>
    </MarketingShell>
  );
}
